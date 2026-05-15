
import { baseApi } from "../../api/baseApi";

const menuApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllMenus: builder.query({
            query: () => ({
                url: '/menu/',
                method: 'GET'
            }),
            providesTags: ['menu']
        }),
        getMenu: builder.query({
            query: (id) => ({
                url: `/menu/${id}`,
                method: 'GET'
            }),
            providesTags: ['menu']
        }),
        addMenu: builder.mutation({
            query: (data) => ({
                url: '/menu',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['menu']
        }),
        updateMenu: builder.mutation({
            query: ({ id, data }) => ({
                url: `/menu/${id}`,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: ['menu']
        }),
        deleteMenu: builder.mutation({
            query: (id) => ({
                url: `/menu/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['menu']
        }),
    })
});

export const {
    useGetAllMenusQuery,
    useGetMenuQuery,
    useAddMenuMutation,
    useUpdateMenuMutation,
    useDeleteMenuMutation,
} = menuApi;
