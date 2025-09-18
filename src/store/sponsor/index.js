import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateSponsor = createAsyncThunk(
  "appSponsor/appCreateSponsor",
  async (params) => {
  console.log(params, "params")
    try {
      const response = await httpService.post("/sponsor",
         {},
           params
          // {
          //   name: params.name,
          //   image: params.image,
          //   hub: params.hub,
          //   user: params.user,
          //   description: params.description,
          //   sanstha: params.sanstha,
          //   startDate: params.startDate,
          //   endDate: params.endDate,
          // }
        );
      if (response?.data) {
        toast.success("Sponsor created Successfully");
        // params.navigate(`/sponsor`);
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appGetAllSponsor = createAsyncThunk(
  "appSponsor/appGetAllSponsor",
  async (params) => {
    try {
      let url = `/sponsor?page=${params.page}&limit=${params.limit}`;
      if (params.hub) {
        url += `&hub=${params.hub}`;
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
      if (params.admin) {
        url += `&admin=${params.admin}`;
      }
      const response = await httpService.get(url);        
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appUpdateSponsor = createAsyncThunk(
  "appSponsor/appUpdateSponsor",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.put(
        `/sponsor/${params.id}`,
        {},
        {
          name: params.name,
          image: params.image,
          hub: params.hub,
          user: params.user,
          description: params.description,
          sanstha: params.sanstha,
          startDate: params.startDate,
          endDate: params.endDate,
          sponsorfee: params.sponsorfee,
          sponsorDate: params.sponsorDate,
          note: params.note
        }
      );
      console.log(response,"response")
      if (response.data) {
        if (params.editImage) {
          params.navigate(`/sponsor/${params?.editImage}/images/list`);
          toast.success("Image is Updated Successfully");
        } else if (params.newImage) {
          params.navigate(`/sponsor/${params?.newImage}/images/list`);
          toast.success("Image is Created Successfully");
        } else if (params.deleteImage) {
          params.navigate(`/sponsor/${params?.deleteImage}/images/list`);
          toast.success("Image is removed successfully");
        } else {
          // params.navigate("/sponsor/1");
          toast.success("Sponsor is Updated Successfully");
        }
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const uploadSponsorImage = async (file) => {
  console.log("file", file)
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response =await httpService.post( `/admin/upload/image`,{},formData,  
      { "Content-Type": "multipart/form-data" }
    );
  console.log("image data",response)

    return response.data.data.data.file;

  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const appDeleteSponsor = createAsyncThunk(
  "appSponsor/appDeleteSponsor",
  async (id) => {
    try {
      const response = await httpService.delete(`/sponsor/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Sponsor Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appSponsorSlice = createSlice({
  name: "Sponsor",
  initialState: {
    sponsor: [],
    sponsorList: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {
    handleSuggestedLanguage: (state, action) => {
      state.slugData.suggested[action.payload.number].sponsor[
        action.payload.index
      ].ischeck = !state.slugData.suggested[action.payload.number].sponsor[
        action.payload.index
      ].ischeck;
      for (let index = 0; index < state.slugData.suggested.length; index++) {
        const element = state.slugData.suggested[index];
        if (element.required) {
          const filterIndex = element.sponsor.filter((i) => i.ischeck);
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
  },
  extraReducers: (builder) => {
    builder.addMatcher(isAllOf(appCreateSponsor.fulfilled), (state, action) => {
      state.sponsor.push(action.payload?.data);
    });
    builder.addMatcher(isAllOf(appDeleteSponsor.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteSponsor.fulfilled), (state, action) => {
      state.isdeleted = true;
      state.sponsor?.splice(
        state.sponsor?.findIndex((data) => data?._id === action.payload.id),
        1
      );
    });
    builder.addMatcher(isAllOf(appDeleteSponsor.rejected), (state, action) => {
      state.isdeleted = false;
    });    
    builder.addMatcher(isAllOf(appUpdateSponsor.fulfilled), (state, action) => {
      const index = state.sponsor?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
      state.sponsor[index] = action?.payload?.data;
      toast.success(action, "sponsor is Updated Successfully");
      // state.slugData = action?.payload?.data;
    });
    builder.addMatcher(isAllOf(appGetAllSponsor.fulfilled), (state, action) => {
      if (action.meta.arg?.isDropdown) {
        state.sponsorList = action.payload?.data;
      } else {
        state.sponsor = action.payload?.data;
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
  },
});

export const { handleSuggestedLanguage } = appSponsorSlice.actions;
export default appSponsorSlice.reducer;
