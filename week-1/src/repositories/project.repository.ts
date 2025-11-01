import { IProject, Project } from "../models/project.model";

export const projectRepository = {
  async create(data: IProject){
    return await Project.create(data);
  },
  async findById(id : string){
    return await Project.findOne({_id : id, deletedAt : null});
  },
  async findAll(userId : string){
    return await Project.find({
      $or : [
        { owner : userId },
      ]
    });
  },
  async softDelete(id : string, userId : string){
    return await Project.findOneAndUpdate(
      { _id: id, owner: userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
  },
  async addMember(projectId : string, userId:string, memberId:string){
    return await Project.findOneAndUpdate(
      { _id: projectId, owner: userId, deletedAt: null },
      { $addToSet: { members: memberId } },
      { new: true }
    );
  },
  async removeMember(projectId : string, userId:string, memberId : string) {
    return await Project.findOneAndUpdate(
      { _id: projectId, owner: userId, deletedAt: null },
      { $pull: { members: memberId } },
      { new: true }
    );
  }
}