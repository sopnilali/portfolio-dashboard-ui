
import { baseApi } from "../../api/baseApi";

const contactApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllContacts: builder.query({
            query: () => ({
                url: '/contact',
                method: 'GET'
            }),
            providesTags: ['contact']
        }),
        addContact: builder.mutation({
            query: (data) => ({
                url: '/contact',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['contact']
        }),
        deleteContact: builder.mutation({
            query: (id) => ({
                url: `/contact/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['contact']
        }),
    })
});

export const {
    useGetAllContactsQuery,
    useAddContactMutation,
    useDeleteContactMutation,
} = contactApi;