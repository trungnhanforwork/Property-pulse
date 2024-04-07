"use client";
import React from "react";
import ClipLoader from "react-spinners/ClipLoader";
const override = {
  display: "block",
  margin: "auto auto",
};
const Spinner = ({ loading }) => {
  return (
    <ClipLoader
      color="#378CE7"
      loading={loading}
      cssOverride={override}
      size={150}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  );
};

export default Spinner;
