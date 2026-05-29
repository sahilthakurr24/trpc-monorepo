import z from "zod";

export const createFormInput = z.object({
    title : z.string().describe('Title of the form'),
    description : z.string().describe('Description of the form')
}) ;


export const createFormOutput = z.object({
    id : z.string().describe('id of the created form')
})