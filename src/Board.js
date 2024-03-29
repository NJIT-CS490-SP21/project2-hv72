import { useState, React, useEffect } from 'react';
import './Board.css';
import io from 'socket.io-client';
import { PropTypes } from 'prop-types';
import { Box } from './Box';

const socket = io();

export function Board(props) {
  const [myList, changeList] = useState(['', '', '', '', '', '', '', '', '']);
  const [isx, changex] = useState([0]);
  // const { userList } = props;
  // const { playerXProp } = props.user_list;
  // const { playerOProp } = props.user_list;
  const playerX = props.user_list[0];
  const playerO = props.user_list[1];

  const { name } = props;

  // got this from https://reactjs.org/tutorial/tutorial.html
  function wincon() {
    let countNonNull = 0;
    for (let i = 0; i <= 8; i += 1) {
      if (myList[i] === '') {
        // continue;
      } else {
        countNonNull += 1;
      }
    }
    if (countNonNull === 9) {
      return 'No winner';
    }
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i += 1) {
      const [a, b, c] = lines[i];
      if (myList[a] && myList[a] === myList[b] && myList[a] === myList[c]) {
        if (myList[a] === 'X' && name === playerX) {
          socket.emit('on_win', [playerX, playerO]);
        } else if (myList[a] === 'O' && name === playerO) {
          socket.emit('on_win', [playerO, playerX]);
        }
        return `${myList[a]} has won the game`;
      }
    }
    return null;
  }

  function onClickDiv(index) {
    const newList = [...myList];
    let countNonNull = 0;
    for (let i = 0; i <= 8; i += 1) {
      if (myList[i] === '') {
        // continue;
      } else {
        countNonNull += 1;
      }
    }
    // console.log(`non nulls: ${countNonNull}`);

    if (newList[index] === '') {
      if (
        isx[0] === 0
        && playerX === name
        && countNonNull % 2 === 0
        && !wincon()
      ) {
        newList[index] = 'X';
        changex([1]);
        socket.emit('tiktaktoe', { arr: newList, xory: [1] });
        changeList([...newList]);
        // console.log(newList);
        // return;
      } else if (
        isx[0] === 1
        && playerO === name
        && countNonNull % 2 === 1
        && !wincon()
      ) {
        newList[index] = 'O';
        changex([0]);
        socket.emit('tiktaktoe', { arr: newList, xory: [0] });
        changeList([...newList]);
        // console.log(newList);
        // return;
      }
    } else {
      // console.log("Can't Click Here");
    }
  }

  function restart() {
    if (playerX === name || playerO === name) {
      const newList = ['', '', '', '', '', '', '', '', ''];
      changex([0]);
      socket.emit('tiktaktoe', { arr: newList, xory: [0] });
      changeList([...newList]);
    }
  }

  useEffect(() => {
    socket.on('tiktaktoe', (data) => {
      // console.log('Tiktaktoe event received');
      // console.log(data.arr);
      // console.log(data.xory);
      changeList([...data.arr]);
      changex(data.xory);
    });
  }, []);

  return (
    <div>
      <h4 style={{ display: 'inline' }}>Current user:</h4>
      <p style={{ display: 'inline' }}>{name}</p>
      <br />
      <h4 style={{ display: 'inline' }}>Player X:</h4>
      <p style={{ display: 'inline' }}>
        {' '}
        {playerX}
      </p>
      <br />
      <h4 style={{ display: 'inline' }}>Player O:</h4>
      <p style={{ display: 'inline' }}>
        {' '}
        {playerO}
      </p>
      <br />
      <h4 style={{ display: 'inline' }}>Spectators:</h4>
      {props.user_list.map((item, index) => {
        if (index !== 0 && index !== 1) {
          return (
            <div>
              <p style={{ display: 'inline' }}>
                &emsp;-
                {item}
              </p>
              <br />
            </div>
          );
        }
        return <div />;
      })}
      <div className="board">
        <Box
          func={() => {
            onClickDiv(0);
          }}
          val={myList[0]}
        />
        <Box
          func={() => {
            onClickDiv(1);
          }}
          val={myList[1]}
        />
        <Box
          func={() => {
            onClickDiv(2);
          }}
          val={myList[2]}
        />
        <Box
          func={() => {
            onClickDiv(3);
          }}
          val={myList[3]}
        />
        <Box
          func={() => {
            onClickDiv(4);
          }}
          val={myList[4]}
        />
        <Box
          func={() => {
            onClickDiv(5);
          }}
          val={myList[5]}
        />
        <Box
          func={() => {
            onClickDiv(6);
          }}
          val={myList[6]}
        />
        <Box
          func={() => {
            onClickDiv(7);
          }}
          val={myList[7]}
        />
        <Box
          func={() => {
            onClickDiv(8);
          }}
          val={myList[8]}
        />
      </div>
      <br />
      <h1>{wincon() ? wincon() : ''}</h1>
      <h1>
        {wincon() ? (
          <button type="button" onClick={() => restart()}>
            Restart
          </button>
        ) : (
          ''
        )}
      </h1>
    </div>
  );
}

Board.propTypes = {
  name: PropTypes.string.isRequired,
  userList: PropTypes.arrayOf(PropTypes.string).isRequired,
  user_list: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Board;
