"use client";

import type { NextPage } from "next";
import CrossChainManager from "~~/components/deployer/CrossChainManager";

const Home: NextPage = () => {
  return (
    <div className="container mx-auto mt-10">
      <CrossChainManager></CrossChainManager>
    </div>
  );
};

export default Home;
