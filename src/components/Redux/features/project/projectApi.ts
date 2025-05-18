import { baseApi } from "../../api/baseApi";

const projectApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllProjects: builder.query({
            query: () => ({
                url: '/project',
                method: 'GET'
            }),
            providesTags: ['project']
        }),
        getProject: builder.query({
            query: (id) => ({
                url: `/project/${id}`,
                method: 'GET'
            }),
            providesTags: ['project']
        }),
        addProject: builder.mutation({
            query: (data) => ({
                url: '/project',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['project']
        }),
        updateProject: builder.mutation({
            query: ({ id, data }) => ({
                url: `/project/${id}`,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: ['project']
        }),
        deleteProject: builder.mutation({
            query: (id) => ({
                url: `/project/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['project']
        }),
    })
});

export const {
    useGetAllProjectsQuery,
    useGetProjectQuery,
    useAddProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
} = projectApi;