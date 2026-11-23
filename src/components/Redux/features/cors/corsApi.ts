import { baseApi } from "../../api/baseApi";

const corsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCorsOrigins: builder.query({
            query: () => ({
                url: '/cors',
                method: 'GET'
            }),
            providesTags: ['cors']
        }),
        addCorsOrigin: builder.mutation({
            query: (data: { origin: string; note?: string }) => ({
                url: '/cors',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['cors']
        }),
        deleteCorsOrigin: builder.mutation({
            query: (id: string) => ({
                url: `/cors/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['cors']
        }),
        regenerateCorsKey: builder.mutation({
            query: (id: string) => ({
                url: `/cors/${id}/key`,
                method: 'POST'
            }),
            invalidatesTags: ['cors']
        }),
    })
});

export const {
    useGetCorsOriginsQuery,
    useAddCorsOriginMutation,
    useDeleteCorsOriginMutation,
    useRegenerateCorsKeyMutation,
} = corsApi;
