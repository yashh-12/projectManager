import Organization from "../models/organization.model.js";
import asyncHandler from "../utils/asyncHandler.js"
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js"
import mongoose, { isValidObjectId } from "mongoose";

const createUserOrganization = asyncHandler(async (req, res) => {
    const { name } = req.body
    const userId = req.user?._id

    if (!name.trim()) {
        throw new apiError(400, "Organization name is required")
    }

    const alreadyExisting = await Organization.findOne({ owner: userId })

    if (alreadyExisting) {
        throw new apiError(400, "User already have an organization")
    }

    const org = await Organization.create(
        {
            name,
            owner: userId
        }
    )

    const newOrg = await Organization.findById(org._id)

    if (!newOrg) {
        throw new apiError(500, "Something went wrong while creating new organization")
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                newOrg,
                "User organization created"
            )
        )
})

const getUserOrganization = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const userOrg = await Organization.findOne({ owner: userId }).populate("projects")

    if (!userOrg) {
        throw new apiError(404, "User organization not found")
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                userOrg,
                "User organization found"
            )
        )
})

const getOrganizationProjects = asyncHandler(async (req, res) => {
    const orgId = req.params

    if (!isValidObjectId(orgId)) {
        throw new apiError(400, "Invalid organization ID")
    }

    const org = await Organization.findOne(orgId)

    if (!org) {
        throw new apiError(404, "Organization not found")
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                org.projects,
                "All projects"
            )
        )
})


export {
    createUserOrganization,
    getUserOrganization,
    getOrganizationProjects,
}