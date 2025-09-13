import { createSlice, createAsyncThunk, isAllOf } from "@reduxjs/toolkit";

// ** Axios Imports
import { toast } from "react-toastify";
import httpService from "../../common/http.service";

export const appCreateEvent = createAsyncThunk(
  "appEvent/appCreateEvent",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.post("/event", {}, params);
      if (response?.data) {
        toast.success("Event created Successfully");
        // params.navigate("/post");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appGetAllEvent = createAsyncThunk(
  "appEvent/appGetAllEvent",
  async (params) => {
    try {
      // const response = await httpService.get(`/post?page=${params.page}&limit=${params.limit}`);
      let url = `/event?page=${params.page}&limit=${params.limit}`;
      if (params.hub) {
        url += `&hubId=${params.hub}`;
      }
      if (params.sanstha) {
        url += `&sansthaId=${params.sanstha}`;
      }
        if (params.categoryOptions) {
        url += `&category=${params.categoryOptions}`;
      }
         if (params.approval_required) {
        url += `&approval_required=${params.approval_required}`;
      }
        if (params.status) {
        url += `&status=${params.status}`;
      }
          if (params.userId) {
        url += `&userId=${params.userId}`;
      }
       const response = await httpService.get(url);  
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);


export const appGetEventDetails = createAsyncThunk(
  "appEvent/appGetEventDetails",
  async (params) => {

    try {
      let url =  `/event/${params}`;
       const response = await httpService.get(url);  
      return await response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appGetUserParticipantsEventDetails = createAsyncThunk(
  "appEvent/appGetUserParticipantsEventDetails",
  async ({ event, status }) => {
    try {
      const url = `/event/participants/?event=${event}`;
      const response = await httpService.get(url);
      return response.data.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appUpdateEvent = createAsyncThunk(
  "appEvent/appUpdateEvent",
  async (params) => {
    console.log(params)
    try {
      const response = await httpService.put(
        `/event/${params.id}`,
        {},
        // params
        {
        title: params.title,
        title: params.title,
        description: params.description,
        hub: params?.hub,
        sanstha: params.sanstha,
        file: params.file,
        // fileType: params.fileType,
        category: params.category,
        startDate: params.startDate,
        endDate: params.endDate,
        volunteers: params.volunteers,
        locationType: params.locationType,
        virtualLink: params.virtualLink,
        nativePlacePincode: params.nativePlacePincode,
        nativeArea: params.nativeArea,
        nativeState: params.nativeState,
        nativeDistrict: params.nativeDistrict,
        nativeBlock: params.nativeBlock,
        nativePlaceAddress: params.nativePlaceAddress,
        RSVP_Enabled: params.RSVP_Enabled,
        Waitlist_Enabled: params.Waitlist_Enabled,
        RSVP_deadline: params.RSVP_deadline,
        RSVP_limit: params.RSVP_limit,
        upi_id: params.upi_id,
        Allow_Vlonteers: params.Allow_Vlonteers,
        allow_photo_upload: params.allow_photo_upload,
        payment_mode_enabled: params.payment_mode_enabled,
        boli_items: params.boli_items,
        event_photo_upload: params.event_photo_upload,
        }
      );
      if (response.data) {
        // params.navigate("/post/1");
        toast.success("Event Updated Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appDeleteEvent = createAsyncThunk(
  "appEvent/appDeletePost",
  async (id) => {
    try {
      const response = await httpService.delete(`/event/${id}`);
      if (response?.data) {
        response.data.id = id;
        toast.success("Event Deleted Successfully");
      }
      return await response.data;
    } catch (error) {
      toast.error(error?.message);
    }
  }
);

export const appEventSlice = createSlice({
  name: "Event",
  initialState: {
    event: [],
    eventDetails: {},
    eventParticipantUserDetails: {},
    slugData: "",
    paginate: "",
    isloder: false,
    isdeleted: false,
  },
  reducers: {
     setEmptyEvent: (state, action) => {
      state.eventDetails = [];
    },
  },
  extraReducers: (builder) => {

    builder.addMatcher(isAllOf(appDeleteEvent.pending), (state, action) => {
      state.isdeleted = false;
    });
    builder.addMatcher(isAllOf(appDeleteEvent.fulfilled), (state, action) => {
      state.isdeleted = true;
      if (Array.isArray(state.event)) {
          const index = state.event.findIndex((data) => data?._id === action.payload.id);
          if (index !== -1) {
            state.event.splice(index, 1);
          }
        }
    });
    builder.addMatcher(isAllOf(appDeleteEvent.rejected), (state, action) => {
      state.isdeleted = false;
    });
       builder.addMatcher(isAllOf(appUpdateEvent.fulfilled), (state, action) => {
      const index = state.event?.data?.findIndex(
        (data) => data?._id === action?.payload?.data?._id
      );
    
      if (index !== -1) {
        state.event.data[index] = action?.payload?.data;
      }
    });
    builder.addMatcher(isAllOf(appGetAllEvent.pending), (state, action) => {
      state.isloder = true;
    });
    builder.addMatcher(isAllOf(appGetAllEvent.fulfilled), (state, action) => {
      state.event = action.payload;
  
      const paginate = {
        hasNextPage: action?.payload?.pagination?.totalPages > action?.payload?.pagination?.currentPage,
        hasPrevPage: action?.payload?.pagination?.currentPage > 1,
        limit: action?.payload?.pagination?.pageSize || 10,
        nextPage: action?.payload?.pagination?.currentPage ? action?.payload?.pagination?.currentPage + 1 : 1,
        page: action?.payload?.pagination?.currentPage || 1,
        pageSize: action?.payload?.pagination?.pageSize || 10,
        pagingCounter: action?.payload?.pagination?.currentPage ? (action?.payload?.pagination?.currentPage - 1) * action?.payload?.pagination?.pageSize + 1 : 1,
        prevPage: action?.payload?.pagination?.currentPage ? action?.payload?.pagination?.currentPage - 1 : 0,
        totalDocs: action?.payload?.pagination?.totalRecords || action?.payload?.data?.length || 0,
        totalPages: action?.payload?.pagination?.totalPages || Math.ceil((action?.payload?.data?.length || 0) / 10)
      };
      state.paginate = paginate;
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appGetEventDetails.fulfilled), (state, action) => {
      state.eventDetails = action.payload;
      // console.log(action.payload)
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appGetUserParticipantsEventDetails.fulfilled), (state, action) => {
      state.eventParticipantUserDetails = action.payload;
      // console.log(action.payload)
      state.isloder = false;
    });
    builder.addMatcher(isAllOf(appGetAllEvent.rejected), (state, action) => {
      state.isloder = false;
    });
  },
});

export const { setEmptyEvent } = appEventSlice.actions;
export default appEventSlice.reducer;
