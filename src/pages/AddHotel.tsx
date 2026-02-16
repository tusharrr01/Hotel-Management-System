import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import useAppContext from "../hooks/useAppContext";
import * as apiClient from "../api-client";
import { useQueryClient } from "react-query";

const AddHotel = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(apiClient.addMyHotel, {
    onSuccess: async () => {
      showToast({
        title: "Hotel Added Successfully!",
        description:
          "Your hotel has been added to the platform. Redirecting to My Hotels...",
        type: "SUCCESS",
      });

      // Refresh user context to update role if auto-upgraded
      try {
        await queryClient.invalidateQueries("validateToken");
        await queryClient.refetchQueries("validateToken");
      } catch (err) {
        console.log("Auto-refresh failed, but continuing...");
      }

      // Redirect to My Hotels page after successful save
      setTimeout(() => {
        navigate("/my-hotels");
      }, 1500);
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const errorMessage = error?.response?.data?.message || error?.message;

      if (status === 403) {
        showToast({
          title: "Access Denied",
          description:
            "You must be a Hotel Owner to add hotels. Please contact admin to upgrade your account.",
          type: "ERROR",
        });
      } else if (status === 404) {
        showToast({
          title: "User Not Found",
          description: "Please log in again and try adding a hotel.",
          type: "ERROR",
        });
      } else {
        showToast({
          title: "Failed to Add Hotel",
          description: errorMessage || "There was an error saving your hotel. Please try again.",
          type: "ERROR",
        });
      }
    },
  });

  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  };

  return <ManageHotelForm onSave={handleSave} isLoading={isLoading} />;
};

export default AddHotel;
