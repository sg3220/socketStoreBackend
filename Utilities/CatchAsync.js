export default (functionCA) => {
  return (vReq, vRes, vNext) => {
    functionCA(vReq, vRes, vNext).catch(vNext);
  };
};
