"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "@/utils/axiosConfig";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const StateContext = createContext(null);

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
};

export const StateProvider = ({ children }) => {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [niches, setNiches] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const customerId = await axios.get("/api/auth/get-cusId", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customerFullname = await axios.get("/api/auth/get-cusFullname", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customerCitizenId = await axios.get("/api/auth/get-cusCitizenId", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser({
        customerId: String(customerId.data),
        fullName: String(customerFullname.data),
        citizenId: String(customerCitizenId.data),
        token,
      });
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await axios.get("/api/buildings");
      setBuildings(response.data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  };

  const fetchFloors = async (buildingId) => {
    try {
      const response = await axios.get(`/api/buildings/${buildingId}/floors`);
      setFloors(response.data);
    } catch (error) {
      console.error("Error fetching floors:", error);
    }
  };

  const fetchAreas = async (buildingId, floorId) => {
    try {
      const response = await axios.get(
        `/api/buildings/${buildingId}/floors/${floorId}/areas`
      );
      setAreas(response.data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const fetchNiches = async (buildingId, floorId, areaId) => {
    try {
      const response = await axios.get(
        `/api/buildings/${buildingId}/floors/${floorId}/areas/${areaId}/niches`
      );
      setNiches(response.data);
    } catch (error) {
      console.error("Error fetching niches:", error);
    }
  };

  const resetSelections = () => {
    setSelectedFloor(null);
    setSelectedArea(null);
    setSelectedNiche(null);
  };

  const resetSectionAndNiche = () => {
    setSelectedArea(null);
    setSelectedNiche(null);
  };

  const resetNiche = () => {
    setSelectedNiche(null);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token);
      fetchCurrentUser(token);
      router.push("/booking");
    } catch (error) {
      console.error("Đăng nhập thất bại", error);
      toast.error("Đăng nhập thất bại. Hãy kiểm tra lại thông tin.");
    }
  };

  const register = async (formData) => {
    try {
      await axios.post("/api/auth/register", formData);
      router.push("/auth/login");
      toast.success("Đăng ký thành công.");
    } catch (error) {
      console.error("Registration failed", error);
      toast.error("Đăng ký thất bại. Vui lòng thử lại sau.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  const makeNicheReservation = async (reservationData) => {
    try {
      const response = await axios.post(
        "/api/Reservations/create-reservation",
        reservationData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <StateContext.Provider
      value={{
        selectedBuilding,
        setSelectedBuilding,
        selectedFloor,
        setSelectedFloor,
        selectedArea,
        setSelectedArea,
        selectedNiche,
        setSelectedNiche,
        buildings,
        setBuildings,
        floors,
        setFloors,
        areas,
        setAreas,
        niches,
        setNiches,
        fetchBuildings,
        fetchFloors,
        fetchAreas,
        fetchNiches,
        resetSelections,
        resetSectionAndNiche,
        resetNiche,
        user,
        loading,
        login,
        register,
        logout,
        makeNicheReservation,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
