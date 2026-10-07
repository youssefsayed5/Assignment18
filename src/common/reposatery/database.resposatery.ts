import { Model } from "mongoose";

export class DatabaseRepository<T> {
  constructor(private Model: Model<T>) {}

  async create(data: T): Promise<T> {
    return await this.Model.create(data);
  }

  async findById({
    id,
    select,
    populate,
    lean,
  }: {
    id: string;
    select?: string;
    populate?: string;
    lean?: boolean;
  }) {
    let query: any = this.Model.findById(id);

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (lean) {
      query = query.lean();
    }

    return await query;
  }

  async findOne({
    filter,
    select,
    populate,
    lean,
  }: {
    filter: any;
    select?: string;
    populate?: string;
    lean?: boolean;
  }) {
    let query: any = this.Model.findOne(filter);

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (lean) {
      query = query.lean();
    }

    return await query;
  }

  async findAll({
    filter,
    select,
    populate,
    lean,
  }: {
    filter?: any;
    select?: string;
    populate?: string;
    lean?: boolean;
  }) {
    let query: any = this.Model.find(filter || {});

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (lean) {
      query = query.lean();
    }

    return await query;
  }

  async updateOne({ filter, data }: { filter: any; data: any }) {
    return await this.Model.updateOne(filter, data);
  }

  async findByIdAndUpdate({
    id,
    data,
    select,
    populate,
    lean,
  }: {
    id: string;
    data: any;
    select?: string;
    populate?: string;
    lean?: boolean;
  }) {
    let query: any = this.Model.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    });

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (lean) {
      query = query.lean();
    }

    return await query;
  }

  async deleteOne(filter: any) {
    return await this.Model.deleteOne(filter);
  }

  async findByIdAndDelete(id: string) {
    return await this.Model.findByIdAndDelete(id);
  }

  async countDocuments(filter?: any) {
    return await this.Model.countDocuments(filter || {});
  }

  async exists(filter: any) {
    return await this.Model.exists(filter);
  }
   async findOneAndUpdate({
    filter,
    data,
    select,
    populate,
    lean,
  }: {
    filter: any;
    data: any;
    select?: string;
    populate?: string;
    lean?: boolean;
  }) {
    let query: any = this.Model.findOneAndUpdate(filter, data, {
      returnDocument: "after",
    });

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (lean) {
      query = query.lean();
    }

    return await query;
  }

  async findExists(filter: any) {
    return await this.Model.exists(filter);
  }
}


