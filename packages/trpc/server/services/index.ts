import UserService from "@repo/services/user";
import FormService from "@repo/services/form";
import FormFieldService from "@repo/services/formField";
import FormSubmissionService from "@repo/services/form-submission";
import GoogleLoginService from "@repo/services/google-login";

export const userService = new UserService();
export const formService = new FormService();
export const formFieldService = new FormFieldService();
export const formSubmissionService = new FormSubmissionService();
export const googleLoginService = new GoogleLoginService();
