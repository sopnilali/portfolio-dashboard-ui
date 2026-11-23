import { baseApi } from "../../api/baseApi";

const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllUsers: builder.query({
            query: () => ({
                url: '/user',
                method: 'GET'
            }),
            providesTags: ['user']
        }),
        getUser: builder.query({
            query: (id) => ({
                url: `/user/${id}`,
                method: 'GET'
            }),
            providesTags: ['user']
        }),
        // body must be FormData: { data: JSON string, file?: File }
        addUser: builder.mutation({
            query: (data) => ({
                url: '/user',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['user']
        }),
        // data must be FormData: { data: JSON string, file?: File }
        updateUser: builder.mutation({
            query: ({ id, data }) => ({
                url: `/user/${id}`,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: ['user']
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/user/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['user']
        }),
        softDeleteUser: builder.mutation({
            query: (id) => ({
                url: `/user/soft/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['user']
        }),
    })
});

export const {
    useGetAllUsersQuery,
    useGetUserQuery,
    useAddUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useSoftDeleteUserMutation,
} = userApi;
