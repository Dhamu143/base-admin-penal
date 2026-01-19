import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useContext } from "react";
import httpService from "../common/http.service";
import { SocketContext } from "../context/socket";

// API Call
const fetchDashboardStats = async () => {
  const response = await httpService.get("/dashboard-stats");
  return response.data.data;
};

export const useDashboardStats = () => {
  const queryClient = useQueryClient();
  const socket = useContext(SocketContext);

  const query = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    // 1. "RUN ONCE": 
    // This prevents auto-refetching on window focus or component remounts.
    // The data is considered fresh forever until we manually invalidate it.
    staleTime: Infinity, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // 2. "UPDATE WHEN DATA CHANGES":
  // Listen to the socket. If the backend says data changed, refetch.
  useEffect(() => {
    if (!socket) return;

    // Ensure socket is connected
    if (!socket.connected) socket.connect();

    // Event handler
    const handleUpdate = () => {
      console.log("🔔 Socket received dashboard update. Refetching...");
      queryClient.invalidateQueries(["dashboardStats"]);
    };

    // Listen for the event (Make sure your Backend emits this event name!)
    socket.on("dashboard_update", handleUpdate);
    socket.on("data_change", handleUpdate); // Example alternative name

    // Cleanup listener on unmount
    return () => {
      socket.off("dashboard_update", handleUpdate);
      socket.off("data_change", handleUpdate);
    };
  }, [socket, queryClient]);

  return query;
};