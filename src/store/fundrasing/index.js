import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";




export const appAllGetFundrasing = createAsyncThunk(
  "appFundrasing/appAllGetFundrasing",
  async (params) => {
    console.log('params', params)
    try {
      let url = `/fundrasing?page=${params.page}&limit=${params.limit}`;
      if (params.hub) {
        url += `&hub=${params.hub}`;
      }
      if (params.sanstha) {
        url += `&sansthaId=${params.sanstha}`;
      }
      if (params.contributionType) {
        url += `&contributionType=${params.contributionType}`;
      }
      if (params.startDate) {
        url += `&startDate=${params.startDate}`;
      }   
      if (params.endDate) {
        url += `&endDate=${params.endDate}`;
      }
        if (params.userId) {
        url += `&userId=${params.userId}`;
      }
      const response = await httpService.get(url);
   //  const response = await httpService.get(`/facilitybooking?page=${params.page}&limit=${params.limit}`);
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appFundrasingSlice = createSlice({
  name: "Fundrasing",
  initialState: {
    fundrasing: [],
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
  
    builder.addMatcher(isAllOf(appAllGetFundrasing.fulfilled), (state, action) => {
   
      state.fundrasing = action.payload?.data;
      console.log(action.payload)
      const paginate = {
        hasNextPage: action?.payload?.data?.pagination?.totalPages > action?.payload?.data?.pagination?.currentPage,
        hasPrevPage: action?.payload?.data?.pagination?.currentPage > 1,
        limit: action?.payload?.data?.pagination?.pageSize,
        nextPage: action?.payload?.data?.pagination?.currentPage + 1,
        page: action?.payload?.data?.pagination?.currentPage,
        pagingCounter: (action?.payload?.data?.pagination?.currentPage - 1) * action?.payload?.data?.pagination?.pageSize + 1,
        prevPage: action?.payload?.data?.pagination?.currentPage - 1,
        totalDocs: action?.payload?.data?.pagination?.totalRecords,
        totalPages: action?.payload?.data?.pagination?.totalPages,
      };
      state.paginate = paginate;
    state.isloder = false;
  });
   
  },
});

export const { handleSuggestedLanguage } = appFundrasingSlice.actions;
export default appFundrasingSlice.reducer;
