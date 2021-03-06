import { Meeting } from '../meeting';
import { RegularMeeting } from '../entities/regular_meeting';

export type CreateInput = {
  askMeeting(): Promise<Meeting>;
  askDuration(): Promise<[Date, Date]>;
  reportCreatedIds(ids: string[]): Promise<void>;
};

export type CreateOutput = {
  save(...meetings: Meeting[]): Promise<string[]>;
};

export const CreateService = async (
  input: CreateInput,
  output: CreateOutput
) => {
  const meeting = await input.askMeeting();
  if (meeting.kind === 'Others') {
    const ids = await output.save(meeting);
    input.reportCreatedIds(ids);
    return;
  }

  const { name, date } = meeting;
  const [start, end] = await input.askDuration();
  const regulars: Meeting[] = [];
  while (date.getDate() < start.getDate()) {
    date.setDate(date.getDate() + 7);
  }
  for (; date.getTime() <= end.getTime(); date.setDate(date.getDate() + 7)) {
    regulars.push(RegularMeeting.from(name, new Date(date)));
  }
  const ids = await output.save(...regulars);
  input.reportCreatedIds(ids);
};
