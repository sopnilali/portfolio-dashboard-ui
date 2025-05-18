
import { baseApi } from "../../api/baseApi";

const skillApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllSkills: builder.query({
            query: () => ({
                url: '/skill',
                method: 'GET'
            }),
            providesTags: ['project']
        }),
        getSkill: builder.query({
            query: (id) => ({
                url: `/skill/${id}`,
                method: 'GET'
            }),
            providesTags: ['project']
        }),
        addSkill: builder.mutation({
            query: (data) => ({
                url: '/skill',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['project']
        }),
        updateSkill: builder.mutation({
            query: ({ id, data }) => ({
                url: `/skill/${id}`,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: ['project']
        }),
        deleteSkill: builder.mutation({
            query: (id) => ({
                url: `/skill/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['project']
        }),
    })
});

export const {
    useGetAllSkillsQuery,
    useGetSkillQuery,
    useAddSkillMutation,
    useUpdateSkillMutation,
    useDeleteSkillMutation,
} = skillApi;