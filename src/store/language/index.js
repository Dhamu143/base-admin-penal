import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateLanguage = createAsyncThunk(
  "appLanguage/appCreateLanguage",
  async (params) => {
    console.log(params,"params")
    try {
      const response = await httpService.post("/language", {}, params);
      if (response?.data) {
        toast.success("Language created Successfully");
        params.navigate(`/language`);
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appGetAllLanguage = createAsyncThunk(
  "appLanguage/appGetAllLanguage",
  async (params) => {
    try {
      let url = `/language?page=${params.page}&limit=${params.limit}`;
      if (params.languageDropdown) {
        url += `&language=${params.languageDropdown}`;
      }
      const response = await httpService.get(url);
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appGetAllLanguageDropdown = createAsyncThunk(
  "appNativePlace/appGetAllNativePlaceDropdown",
  async (params) => {
    try {
      const response = await httpService.get(`/language?page=${params.page}&limit=${params.limit}`);
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateLanguage = createAsyncThunk(
  "appLanguage/appUpdateLanguage",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.put(
        `/language/${params.id}`,
        {},
        // params
        {
          name: params.name,
        }
      );
      console.log(response,"response")
      if (response.data) {
        if (params.editImage) {
          params.navigate(`/language/${params?.editImage}/images/list`);
          toast.success("Image is Updated Successfully");
        } else if (params.newImage) {
          params.navigate(`/language/${params?.newImage}/images/list`);
          toast.success("Image is Created Successfully");
        } else if (params.deleteImage) {
          params.navigate(`/language/${params?.deleteImage}/images/list`);
          toast.success("Image is removed successfully");
        } else {
          params.navigate("/language/1");
          toast.success("Language is Updated Successfully");
        }
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteLanguage = createAsyncThunk(
  "appLanguage/appDeleteLanguage",
  async (id) => {
    try {
      const response = await httpService.delete(`/language/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Language Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appLanguageSlice = createSlice({
  name: "Language",
  initialState: {
    language: [],
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {
    handleSuggestedLanguage: (state, action) => {
      state.slugData.suggested[action.payload.number].language[
        action.payload.index
      ].ischeck = !state.slugData.suggested[action.payload.number].language[
        action.payload.index
      ].ischeck;
      for (let index = 0; index < state.slugData.suggested.length; index++) {
        const element = state.slugData.suggested[index];
        if (element.required) {
          const filterIndex = element.language.filter((i) => i.ischeck);
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
    builder.addMatcher(isAllOf(appCreateLanguage.fulfilled), (state, action) => {
      state.language.push(action.payload?.data);
    });
    builder.addMatcher(isAllOf(appDeleteLanguage.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteLanguage.fulfilled), (state, action) => {
      state.isdeleted = true;
      // state.language?.splice(
      //   state.language?.findIndex((data) => data?._id === action.payload.id),
      //   1
      // );
    });
    builder.addMatcher(isAllOf(appDeleteLanguage.rejected), (state, action) => {
      state.isdeleted = false;
    });    
    builder.addMatcher(isAllOf(appUpdateLanguage.fulfilled), (state, action) => {
      const index = state.language?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
      state.language[index] = action?.payload?.data;
      toast.success(action, "Language is Updated Successfully");
      // state.slugData = action?.payload?.data;
    });
    builder.addMatcher(isAllOf(appGetAllLanguage.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetAllLanguage.fulfilled), (state, action) => {
      state.language = action.payload?.data;
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
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appGetAllLanguage.rejected), (state, action) => {
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appGetAllLanguageDropdown.fulfilled), (state, action) => {
      state.languageDropdown = action.payload?.data || [];
    });
  },
});

export const { handleSuggestedLanguage } = appLanguageSlice.actions;
export default appLanguageSlice.reducer;
