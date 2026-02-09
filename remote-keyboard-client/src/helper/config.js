const handleConfig = (user) => {
  return {
    headers: {
        'Content-Type': 'application/json',
        "X-User-Id": user,
    },
  };
};

export { handleConfig };
