import { baseApi } from "../../api/baseApi";

const blogApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllBlogs: builder.query({
            query: () => ({
                url: '/blog/all',
                method: 'GET'
            }),
            providesTags: ['blog']
        }),
        getBlog: builder.query({
            query: (id) => ({
                url: `/blog/${id}`,
                method: 'GET'
            }),
            providesTags: ['blog']
        }),
        addBlog: builder.mutation({
            query: (data) => ({
                url: '/blog/create',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['blog']
        }),
        updateBlog: builder.mutation({
            query: ({ id, data }) => ({
                url: `/blog/${id}`,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: ['blog']
        }),
        deleteBlog: builder.mutation({
            query: (id) => ({
                url: `/blog/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['blog']
        }),
        editorUpload: builder.mutation({
            query: (data) => ({
                url: '/blog/editor-upload',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['blog']
        }),
    })
});

export const {
    useGetAllBlogsQuery,
    useGetBlogQuery,
    useAddBlogMutation,
    useUpdateBlogMutation,
    useDeleteBlogMutation,
    useEditorUploadMutation
} = blogApi;
