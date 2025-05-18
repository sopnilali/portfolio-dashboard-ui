
import { baseApi } from "../../api/baseApi";

const experienceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllExperiences: builder.query({
            query: () => ({
                url: '/experience',
                method: 'GET'
            }),
            providesTags: ['project']
        }),
        getExperience: builder.query({
            query: (id) => ({
                url: `/experience/${id}`,
                method: 'GET'
            }),
            providesTags: ['project']
        }),
        addExperience: builder.mutation({
            query: (data) => ({
                url: '/experience',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['project']
        }),
        updateExperience: builder.mutation({
            query: ({ id, data }) => ({
                url: `/experience/${id}`,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: ['project']
        }),
        deleteExperience: builder.mutation({
            query: (id) => ({
                url: `/experience/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['project']
        }),
    })
});

export const {
    useGetAllExperiencesQuery,
    useGetExperienceQuery,
    useAddExperienceMutation,
    useUpdateExperienceMutation,
    useDeleteExperienceMutation,
} = experienceApi;