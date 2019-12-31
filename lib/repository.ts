import { FetchOutput } from './services/fetch_service';
import { CreateOutput } from './services/create_service';
import { UpdateOutput } from './services/update_service';
import { AbortOutput } from './services/abort_service';
import { Meeting, testDatas } from './meeting';

export class OnMemoryRepository
  implements FetchOutput, CreateOutput, UpdateOutput, AbortOutput {
  static readonly inst = new OnMemoryRepository();

  private constructor() {}

  meetings: Meeting[] = testDatas;
  incremental: number = 0;

  save = async (...meetings: Meeting[]): Promise<string[]> => {
    const addedIds: string[] = [];
    for (const toAdd of meetings) {
      const id = this.incremental.toString();
      addedIds.push(id);
      this.meetings.push({ ...toAdd, _id: id });
      ++this.incremental;
    }
    return addedIds;
  };

  getAll = async (): Promise<Meeting[]> => {
    return this.meetings;
  };

  find = async (id: string): Promise<Meeting> => {
    const found = this.meetings.find(m => m._id === id);
    if (found == null) throw 'Illegal id';
    return found;
  };

  read = async (): Promise<Meeting[]> => {
    return this.meetings;
  };

  update = async (...meetings: Meeting[]): Promise<void> => {
    this.meetings = [...this.meetings, ...meetings];
  };
}

import { GetMeetings } from '../db/meetings';

export class RealRepository
  implements FetchOutput, CreateOutput, UpdateOutput, AbortOutput {
  static readonly inst = new RealRepository();

  private constructor(private Meetings = GetMeetings()) {}

  async save(...meetings: Meeting[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.Meetings.insertMany(meetings, (e, res) => {
        if (e != null) reject(e);
        else resolve(res.map(m => m._id));
      });
    });
  }

  async getAll(): Promise<Meeting[]> {
    return await this.Meetings.find({});
  }

  async read(duration: [Date, Date]): Promise<Meeting[]> {
    const [from, to] = duration;
    return new Promise((resolve, reject) => {
      this.Meetings.find({ date: { $gte: from, $lte: to } }, (e, res) => {
        if (e != null) reject(e);
        else resolve(res);
      });
    });
  }

  async find(id: string): Promise<Meeting> {
    const found = await this.Meetings.findOne({ _id: id });
    if (found == null) {
      throw 'the meeting has not found';
    }
    return {
      _id: id,
      name: found.name,
      date: found.date,
      kind: found.kind,
      expired: found.expired,
    };
  }

  async update(...meetings: Meeting[]): Promise<void> {
    for (const m of meetings) {
      const { _id, ...others } = m;
      await this.Meetings.replaceOne({ _id }, others);
    }
  }
}
