import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";





export const appPendingMembership = createAsyncThunk(
  "appSanstha/appPendingMembership",
  async (params) => {
    console.log(params)
    try {
      let url = `/sanstha/pendingmembers?page=${params.page}&limit=${params.limit}`;
      if (params.hub) {
        url += `&hub=${params.hub}`;
      }
      if (params.sanstha) {
        url += `&sansthaId=${params.sanstha}`;
      }
      if (params.startDate) {
        url += `&startDate=${params.startDate}`;
      }   
      if (params.endDate) {
        url += `&endDate=${params.endDate}`;
      }
      const response = await httpService.post(url);
      // const response = await httpService.post(`/sanstha/pendingmembers?page=${params.page}&limit=${params.limit}`);
      console.log(response, "response")
      return response.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }
);


export const appPendingMembershipSlice = createSlice({
  name: "PendingMembership",
  initialState: {
    pendingMembership: [],
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
  
    builder.addMatcher(isAllOf(appPendingMembership.fulfilled), (state, action) => {
      state.pendingMembership = action.payload?.responses.data;
      console.log(action.payload?.responses.data)
      const paginate = {
        hasNextPage: action?.payload?.responses.data?.pagination?.totalPages > action?.payload?.responses.data?.pagination?.currentPage,
        hasPrevPage: action?.payload?.responses.data?.pagination?.currentPage > 1,
        limit: action?.payload?.responses.data?.pagination?.pageSize,
        nextPage: action?.payload?.responses.data?.pagination?.currentPage + 1,
        page: action?.payload?.responses.data?.pagination?.currentPage,
        pagingCounter: (action?.payload?.responses.data?.pagination?.currentPage - 1) * action?.payload?.responses.data?.pagination?.pageSize + 1,
        prevPage: action?.payload?.responses.data?.pagination?.currentPage - 1,
        totalDocs: action?.payload?.responses.data?.pagination?.totalRecords,
        totalPages: action?.payload?.responses.data?.pagination?.totalPages,
      };
      state.paginate = paginate;
    state.isloder = false;
  });
   
  },
});

export const { handleSuggestedLanguage } = appPendingMembershipSlice.actions;
export default appPendingMembershipSlice.reducer;
