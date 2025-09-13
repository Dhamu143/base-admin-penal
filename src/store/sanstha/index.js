import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";
import axios from "axios";

export const appCreateSanstha = createAsyncThunk(
  "appSanstha/appCreateSanstha",
  async (params) => {
    try {
      const response = await httpService.post("/sanstha", {}, params);
      if (response?.data) {
        toast.success("Sanstha created Successfully");
        if (params.navigate) {
          params.navigate("/sanstha");
        }
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appGetAllSanstha = createAsyncThunk(
  "appSanstha/appGetAllSanstha",
  async (params) => {
    try {
      let url = `/sanstha?page=${params.page}&limit=${params.limit}`;
      if (params.hubDropdown) {
        url += `&hub=${params.hubDropdown}`;
      }
      if (params.sanstha) {
        url += `&sanstha=${params.sanstha}`;
      }
      if (params.religion) {
        url += `&religion=${params.religion}`;
      }
      if (params.nativeplace) {
        url += `&nativeplace=${params.nativeplace}`;
      }
      if (params.language) {
        url += `&language=${params.language}`;
      }
      if (params.caste) {
        url += `&caste=${params.caste}`;
      }
      if (params.hub) {
        url += `&hub=${params.hub}`;
      }
      const response = await httpService.get(url);        
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appGetSansthaById = createAsyncThunk(
  "appSanstha/appGetSansthaById",
  async (id) => {
    try {
      const response = await httpService.get(`/sanstha/${id}`);
      // console.log(response)
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const uploadSansthaImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

const response =await httpService.post( `/upload/sanstha`,{},formData,  { "Content-Type": "multipart/form-data" });
console.log(response)
      // if (!response.ok) {
      //   throw new Error("Upload failed"); 
      // }

    //  console.log( response.data.data.data.file)
    return response.data.data.data.file;

  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const appUpdateSanstha = createAsyncThunk(
  "appSanstha/appUpdateSanstha",
  async (params) => {
    console.log(params)
    try {
      const updateData = {
        name: params.name,
        image: params.image,
        hub: typeof params.hub === 'object' ? params.hub._id : params.hub,
        description: params.description,
        pincode: params?.pincode,
        area: params?.area,
        state: params?.state,
        district: params?.district,
        taluka: params?.taluka,
        sansthaaddress: params?.sansthaaddress,
        active: params.active,
        verified: params.verified,
        isRegistered: params?.isRegistered,
        aadhaarnumber: params?.aadhaarnumber,
        pancardnumber: params?.pancardnumber,
        aadhaarFront: params?.aadhaarFront,
        aadhaarBack: params?.aadhaarBack,
        panCardImage: params?.panCardImage,
        place: params.place,
      
          registrationNumber: params?.registrationNumber,
          registrationDate: params?.registrationDate,
          sansthaType: params?.sansthaType,
          Act: params?.Act,
          sansthaPanCardNumber: params?.sansthaPanCardNumber,
          authorityLetters: params?.authorityLetters,
          sansthaCertificate: params?.sansthaCertificate,
          sansthaPanCardImage: params?.sansthaPanCardImage,
          acceptingnewmember: params?.acceptingnewmember,
      
        verifiedAadharCard: params?.verifiedAadharCard,
        verifiedPancard: params?.verifiedPancard,
        verifiedRegistrationNumber: params?.verifiedRegistrationNumber,
        verifiedSansthaPancard: params?.verifiedSansthaPancard,

        upi_id: params.upi_id,
      };
   console.log(updateData)
      const response = await httpService.put(
        `/sanstha/${params.id}`,
        {},
        updateData
      );
      if (response.data) {
        if (params.editImage) {
          params.navigate(`/sanstha/${params?.editImage}/images/list`);
          toast.success("Image is Updated Successfully");
        } else if (params.newImage) {
          params.navigate(`/sanstha/${params?.newImage}/images/list`);
          toast.success("Image is Created Successfully");
        } else if (params.deleteImage) {
          params.navigate(`/sanstha/${params?.deleteImage}/images/list`);
          toast.success("Image is removed successfully");
        } else {
          if (params.navigate) {
            // params.navigate("/sanstha/1");
          }
          toast.success("Sanstha is Updated Successfully");
        }
      }
      return await response.data; 
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteSanstha = createAsyncThunk(
  "appSanstha/appDeleteSanstha",
  async (id) => {
    try {
      const response = await httpService.delete(`/sanstha/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Sanstha Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appJoinSanstha = createAsyncThunk(
  "appSanstha/appJoinSanstha",
  async (params) => {
    try {
      const response = await httpService.post("/sanstha/joinsanstha", {}, params);
      if (response?.data) {
        toast.success("Sanstha Joined Successfully");
        // if (params.navigate) {
        //   params.navigate("/sanstha");
        // }
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appSansthaAssignAdmin = createAsyncThunk(
  "appSanstha/appSansthaAssignAdmin",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.post("/sanstha/makesansthaadmin", {}, params);
      console.log(response)
      // if (response?.data) {
        toast.success("Sanstha Assign Successfully");
      // }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appSansthRemoveAdmin = createAsyncThunk(
  "appSanstha/appSansthRemoveAdmin",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.post("/sanstha/removesansthaadmin", {}, params);
      console.log(response)
      if (response?.data) {
        toast.success("Remove Sanstha Admin Successfully");
   
      }
     return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appLeaveSanstha = createAsyncThunk(
  "appSanstha/appLeaveSanstha",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.post("/sanstha/leavesanstha", {}, params);
      if (response?.data) {
        toast.success("Sanstha Remove Successfully");
        if (params.navigate) {
          params.navigate("/sanstha");
        }
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appCreateMembership = createAsyncThunk(
  "appSanstha/appCreateMembership",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.post("/sanstha/membership", {}, params);
      toast.success("Membership Created");
      return response.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }
);

export const appUpdateMembership = createAsyncThunk(
  "appSanstha/appUpdateMembership",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.post(
        "/sanstha/membership/update",
        {},
        {
          sansthaId: params.sansthaId,
          membership: params.membership,
          membershipId: params.membershipId,
          // honoraryReason: params.membership.honoraryReason
        }
      );
      console.log(response, "response")
      toast.success("Membership Updated");
      return response.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }
);

export const appDeleteMembership = createAsyncThunk(
  "appSanstha/appDeleteMembership",
  async (params) => {
    try {
      const response = await httpService.post("/sanstha/membership/delete",{}, params);
      toast.success("Membership Deleted");
      return response.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }
);


export const appPendingMembershipList = createAsyncThunk(
  "appSanstha/appPendingMembershipList",
  async (payload) => {
    console.log(payload)
    try {
      const response = await httpService.post(`/sanstha/pendingmembers?sansthaId=${payload}`);
      // toast.success("Membership List");
      return response.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }
);

export const appDeletesansthaMembership = createAsyncThunk(
  "appSanstha/appDeletesansthaMembership",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.post("/sanstha/deleteUserMembership",{}, params);
      toast.success("Sanstha Membership Deleted");
      return response.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }
);
export const appAcceptsansthaMembership = createAsyncThunk(
  "appSanstha/appAcceptsansthaMembership",
  async (params) => {
    console.log(params);
    try {
      const response = await httpService.post(
        `/sanstha/updateUserMembership?membershipId=${params.membershipId}`,
        {},
        {
         "status": "Accepted"
        }
      );
      toast.success("Sanstha Membership Accepted");
      return response.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }
);


export const appRejctedsansthaMembership = createAsyncThunk(
  "appSanstha/appRejctedsansthaMembership",
  async (params) => {
    console.log(params)
     try {
      const response = await httpService.post(
        `/sanstha/updateUserMembership?membershipId=${params.membershipId}`,
        {},
        {
          "status": "Rejected",
          rejectionreason: params.rejectionreason
        }
      );
      toast.success("Membership request rejected.");
      return response.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }
);

export const appGetPincode = createAsyncThunk(
  "appSanstha/appGetPincode",
  async (pincode, thunkAPI) => {
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = response.data?.[0];

      if (data?.Status === "Success") {
        return data.PostOffice; 
      } else {
        toast.error(data?.Message || "Invalid PIN code");
        return thunkAPI.rejectWithValue(data?.Message);
      }
    } catch (error) {
      toast.error("Failed to fetch PIN code data");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const appSansthaSlice = createSlice({
  name: "Sanstha",
  initialState: {
    sanstha: [],
    sansthaList: [],
    pendingMembershipList: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {
    handleSuggestedLanguage: (state, action) => {
      state.slugData.suggested[action.payload.number].sanstha[
        action.payload.index
      ].ischeck = !state.slugData.suggested[action.payload.number].sanstha[
        action.payload.index
      ].ischeck;
      for (let index = 0; index < state.slugData.suggested.length; index++) {
        const element = state.slugData.suggested[index];
        if (element.required) {
          const filterIndex = element.sanstha.filter((i) => i.ischeck);
          if (filterIndex.length) {
            if (element.maximum < filterIndex.length) {
              element.formIsValid = false;
              return;
            } else {
              element.formIsValid = true;
            }
          } else {
            element.formIsValid = false;
            return;
          }
        } else {
          element.formIsValid = true;
        }
      }
    },
    setEmptySanstha: (state, action) => {
      state.sansthaDetails = [];
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isAllOf(appCreateSanstha.fulfilled), (state, action) => {
      state.sanstha.push(action.payload?.data);
    });
    builder.addMatcher(isAllOf(appDeleteSanstha.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteSanstha.fulfilled), (state, action) => {
      state.isdeleted = true;
      state.sanstha?.splice(
        state.sanstha?.findIndex((data) => data?._id === action.payload.id),
        1
      );
    });
    builder.addMatcher(isAllOf(appDeleteSanstha.rejected), (state, action) => {
      state.isdeleted = false;
    });    
    builder.addMatcher(isAllOf(appGetSansthaById.pending), (state) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetSansthaById.fulfilled), (state, action) => {
      state.isloder = false;
      state.sansthaDetails = action.payload.data;
    });
    builder.addMatcher(isAllOf(appGetSansthaById.rejected), (state) => {
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appUpdateSanstha.fulfilled), (state, action) => {
      const index = state.sanstha?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
      state.sanstha[index] = action?.payload?.data;
      toast.success(action, "Sanstha is Updated Successfully");
      // state.slugData = action?.payload?.data;
    });
    builder.addMatcher(isAllOf(appGetAllSanstha.fulfilled), (state, action) => {
      if (action.meta.arg?.isDropdown) {
        state.sansthaList = action.payload?.data;
      } else {
        state.sanstha = action.payload?.data;
        const paginate = {
          hasNextPage: action?.payload?.pagination?.totalPages > action?.payload?.pagination?.currentPage,
          hasPrevPage: action?.payload?.pagination?.currentPage > 1,
          limit: action?.payload?.pagination?.pageSize,
          nextPage: action?.payload?.pagination?.currentPage + 1,
          page: action?.payload?.pagination?.currentPage,
          pagingCounter: (action?.payload?.pagination?.currentPage - 1) * action?.payload?.pagination?.pageSize + 1,
          prevPage: action?.payload?.pagination?.currentPage - 1,
          totalDocs: action?.payload?.pagination?.totalRecords,
          totalPages: action?.payload?.pagination?.totalPages,
        };
        state.paginate = paginate;
      }
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appPendingMembershipList.fulfilled), (state, action) => {
        state.pendingMembershipList = action.payload?.responses.data.data;
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appJoinSanstha.pending), (state) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appJoinSanstha.fulfilled), (state, action) => {
      state.isloder = false;
      // Update the sanstha list to reflect the new user
      const updatedSanstha = state.sanstha.map(s => {
        if (s._id === action.payload.data.sansthaId) {
          return {
            ...s,
            users: [...(s.users || []), action.payload.data.userId]
          };
        }
        return s;
      });
      state.sanstha = updatedSanstha;
    });
    builder.addMatcher(isAllOf(appJoinSanstha.rejected), (state) => {
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appLeaveSanstha.pending), (state) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appLeaveSanstha.fulfilled), (state, action) => {
      state.isloder = false;
      // Update the sanstha list to remove the user
      const updatedSanstha = state.sanstha.map(s => {
        if (s._id === action.payload.data.sansthaId) {
          return {
            ...s,
            users: (s.users || []).filter(id => id !== action.payload.data.userId)
          };
        }
        return s;
      });
      state.sanstha = updatedSanstha;
    });
    builder.addMatcher(isAllOf(appLeaveSanstha.rejected), (state) => {
      state.isloder = false;
    });
  },
});

export const { handleSuggestedLanguage, setEmptySanstha } = appSansthaSlice.actions;
export default appSansthaSlice.reducer;
