
import { baseApi } from "../../api/baseApi";

/** POST/PATCH send `multipart/form-data` — do not set Content-Type (browser sets boundary). */
const aboutApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllAbout: builder.query({
            query: () => ({
                url: '/about',
                method: 'GET'
            }),
            providesTags: ['about']
        }),
        getAbout: builder.query({
            query: (id) => ({
                url: `/about/${id}`,
                method: 'GET'
            }),
            providesTags: ['about']
        }),
        addAbout: builder.mutation({
            query: (formData: FormData) => ({
                url: '/about',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['about']
        }),
        updateAbout: builder.mutation({
            query: ({ id, formData }: { id: string; formData: FormData }) => ({
                url: `/about/${id}`,
                method: 'PATCH',
                body: formData,
            }),
            invalidatesTags: ['about']
        }),
        deleteAbout: builder.mutation({
            query: (id) => ({
                url: `/about/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['about']
        }),
        /** POST multipart `file` — same storage contract as blog editor-upload. */
        uploadAboutImage: builder.mutation({
            query: (formData: FormData) => ({
                url: '/blog/editor-upload',
                method: 'POST',
                body: formData,
            }),
        }),
    })
});

export const {
    useGetAllAboutQuery,
    useGetAboutQuery,
    useAddAboutMutation,
    useUpdateAboutMutation,
    useDeleteAboutMutation,
    useUploadAboutImageMutation,
} = aboutApi;
