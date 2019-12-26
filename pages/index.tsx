import { NextPage } from 'next';
import { FC, Fragment, useState } from 'react';
import fetch from 'isomorphic-unfetch';
import { Meeting } from '../lib/meeting';

const Calendar: FC<{ meetings: Meeting[] }> = ({ meetings }) => (
  <Fragment>
    <ul>
      {meetings.map(m => (
        <li key={m.date.toString()}>{m.name}</li>
      ))}
    </ul>
  </Fragment>
);

const Index: NextPage<{ meetings: Meeting[] }> = ({ meetings }) => {
  const [ids, setIds] = useState<string[]>([]);

  return (
    <Fragment>
      <h1>部内カレンダー</h1>
      <Calendar meetings={meetings} />
      <button
        onClick={async e => {
          const res = await fetch('http://localhost:3000/api/create', {
            method: 'post',
            body: JSON.stringify({
              kind: 'Others',
              name: 'ホゲ談義',
              date: '2019-12-12T12:12:00',
            }),
          });
          const { ids } = await res.json();
          console.log(ids);
          setIds(ids);
        }}
      >
        集会を作る
      </button>
      <style jsx>{`
        h1 {
          color: darkblue;
        }
      `}</style>
    </Fragment>
  );
};

Index.getInitialProps = async (): Promise<{ meetings: Meeting[] }> => {
  const meetings = await fetch('http://localhost:3000/api/meetings')
    .then(res => res.json())
    .then(json => json.meetings);
  return { meetings };
};

export default Index;
