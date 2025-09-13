import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateCompliance = createAsyncThunk(
  "appCompliance/appCreateCompliance",
  async (params) => {
    console.log(params,"params")
    try {
      const response = await httpService.post("/compliance", {}, params);
      if (response?.data) {
        toast.success("Compliances  created Successfully");
        // params.navigate(`/compliance`);
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appAllGetCompliance = createAsyncThunk(
  "appCompliance/appAllGetCompliance",
  async () => {
    try {
     const response = await httpService.get(`/compliance`);
     
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateCompliance = createAsyncThunk(
  "appCompliance/appUpdateCompliance",
  async (params) => {
    console.log(params)
    // const { id, ...updateData } = params;
    try {
      const response = await httpService.put(
        `/compliance/${params.id}`,
        {},
        // updateData
        {
          name: params.name,
          documenttype: params.documenttype,
          file: params.file,
          sanstha: params.sanstha,
        }
      );
      console.log(response,"response")
    
      toast.success("Compliances is Updated Successfully");
      
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteCompliance = createAsyncThunk(
  "appCompliance/appDeleteCompliance",
  async (id) => {
    try {
        const response = await httpService.delete(`/compliance/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Compliances Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);
export const uploadComplianceImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response =await httpService.post( `/upload/compliance`,{},formData,  { "Content-Type": "multipart/form-data" });
    return response.data.data.data.file;

  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};


export const appComplianceSlice = createSlice({
  name: "Compliances",
  initialState: {
    compliancesList: [],
    isloder: false,
    paginate: "",
    isdeleted: false,
  },
  reducers: {},
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appAllGetCompliance.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(
      isAllOf(appAllGetCompliance.fulfilled),
      (state, action) => {
        state.compliancesList = action.payload;
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
      }
    );
    builder.addMatcher(
      isAllOf(appAllGetCompliance.rejected),
      (state, action) => {
        state.isloder = false;
      }
    );
    builder.addMatcher(isAllOf(appDeleteCompliance.pending), (state, action) => {
      state.isloder = true;
      state.isdeleted = false;
    });
    builder.addMatcher(
      isAllOf(appDeleteCompliance.fulfilled),
      (state, action) => {
        state.isdeleted = true;
        state.compliancesList?.splice(
          state.compliancesList?.findIndex((data) => data?._id === action.payload.id),
          1
        );
        state.isloder = false;
      }
    );
    builder.addMatcher(isAllOf(appDeleteCompliance.rejected), (state) => {
      state.isdeleted = false;
      state.isloder = false;
    });
  },
});
  
export default appComplianceSlice.reducer;