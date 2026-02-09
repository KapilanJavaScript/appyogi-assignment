const COLOR_MAP = {
  1: 'white',
  2: 'red',
  3: 'yellow' 
};

const USER_COLOR_MAP = {
  1: COLOR_MAP[2], // user 1 gets red
  2: COLOR_MAP[3]  // user 2 gets yellow
}

export { COLOR_MAP, USER_COLOR_MAP };