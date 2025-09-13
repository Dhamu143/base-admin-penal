import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateCaste = createAsyncThunk(
  "appCaste/appCreateCaste",
  async (params) => {
    // console.log(params,"params")
    try {
      const response = await httpService.post("/caste", {}, params);
      if (response?.data) {
        toast.success("Caste created Successfully");
        params.navigate(`/caste`);
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appGetAllCaste = createAsyncThunk(
  "appCaste/appGetAllCaste",
  async (params) => {
    // console.log(params)
    try {
      let url = `/caste?page=${params.page}&limit=${params.limit}`;
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
      const response = await httpService.get(url);      
    // console.log(response)  
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appUpdateCaste = createAsyncThunk(
  "appCaste/appUpdateCaste",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.put(
        `/caste/${params.id}`,
        {},
        // params
        {
          name: params.name,
          language: params.language,
          nativeplace: params.nativeplace,
          religion: params.religion,
          significance: params.significance,
          gotra: params.gotra,
        }
      );
      // console.log(response,"response")
      if (response.data) {
        if (params.editImage) {
          params.navigate(`/caste/${params?.editImage}/images/list`);
          toast.success("Image is Updated Successfully");
        } else if (params.newImage) {
          params.navigate(`/caste/${params?.newImage}/images/list`);
          toast.success("Image is Created Successfully");
        } else if (params.deleteImage) {
          params.navigate(`/caste/${params?.deleteImage}/images/list`);
          toast.success("Image is removed successfully");
        } else {
          params.navigate("/caste/1");
          toast.success("caste is Updated Successfully");
        }
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteCaste = createAsyncThunk(
  "appCaste/appDeleteCaste",
  async (id) => {
    try {
      const response = await httpService.delete(`/caste/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Caste Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appCasteSlice = createSlice({
  name: "Caste",
  initialState: {
    caste: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {
    handleSuggestedLanguage: (state, action) => {
      state.slugData.suggested[action.payload.number].caste[
        action.payload.index
      ].ischeck = !state.slugData.suggested[action.payload.number].caste[
        action.payload.index
      ].ischeck;
      for (let index = 0; index < state.slugData.suggested.length; index++) {
        const element = state.slugData.suggested[index];
        if (element.required) {
          const filterIndex = element.caste.filter((i) => i.ischeck);
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
    builder.addMatcher(isAllOf(appCreateCaste.fulfilled), (state, action) => {
      state.caste.push(action.payload?.data);
    });
    builder.addMatcher(isAllOf(appDeleteCaste.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteCaste.fulfilled), (state, action) => {
      state.isdeleted = true;
      // state.caste?.splice(
      //   state.caste?.findIndex((data) => data?._id === action.payload.id),
      //   1
      // );
    });
    builder.addMatcher(isAllOf(appDeleteCaste.rejected), (state, action) => {
      state.isdeleted = false;
    });    
    builder.addMatcher(isAllOf(appUpdateCaste.fulfilled), (state, action) => {
      const index = state.caste?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
      state.caste[index] = action?.payload?.data;
      toast.success(action, "Caste is Updated Successfully");
      // state.slugData = action?.payload?.data;
    });
    builder.addMatcher(isAllOf(appGetAllCaste.fulfilled), (state, action) => {
      if (action.meta.arg?.isDropdown) {
        state.dropdownCasteList = action.payload?.data; 
      } else {
        state.caste = action.payload?.data; 
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

export const { handleSuggestedLanguage } = appCasteSlice.actions;
export default appCasteSlice.reducer;
