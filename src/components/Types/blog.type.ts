export type BlogUser = {
  name: string;
  email: string;
  avaterUrl: string;
  role: string;
};

export type BlogStatus = "Published" | "Draft";

export type TBlog = {
  id: string;
  title: string;
  shortdescription: string;
  content: string;
  tags: string[];
  imageUrl: string;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  user: BlogUser;
};

export type BlogFormData = {
  title: string;
  shortdescription: string;
  content: string;
  tags: string[];
  status: BlogStatus;
  imageUrl: File | string | null;
};
