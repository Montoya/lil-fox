"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BigNumber, ContractInterface, ethers } from "ethers";
import config from "@/config/index";

declare global {
  interface Window {
    ethereum: any;
  }
}

const tokenIdToSkin = new Map<number | string, number | string>([
  [0, "blue"],
  ["blue", 0],
]);

export default function Home() {
  const [hasFlask, setHasFlask] = useState(false);
  const [initiated, setInitiated] = useState(false);
  const [ownedSkins, setOwnedSkins] = useState<string[]>([]);
  let game = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    isFlask().then((result) => {
      setHasFlask(result);
    });
  });

  useEffect(() => {
    const setUserSkins = async () => {
      if (config.chainId != window.ethereum.networkVersion) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0xE704",
            rpcUrls: ["https://rpc.goerli.linea.build/"],
            chainName: "Linea Testnet",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18
            },
            blockExplorerUrls: ["https://goerli.lineascan.build/"]
          }]
        });
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const windowProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = windowProvider.getSigner();
      const address = await signer.getAddress();

      const erc1155Interface: ContractInterface = [
        'function balanceOf(address account, uint256 id) external view returns (uint256)',
        'function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory)'
      ]

      const provider = new ethers.providers.JsonRpcProvider(config.lineaRpcUrl)
      const lilFoxSkinsContract = new ethers.Contract(config.foxSkinContractAddress, erc1155Interface, provider)

      const tokenIdsArray = Array.from({ length: config.maxNftSkinId + 1 }, (_, i) => i);
      const addressesArray = Array(config.maxNftSkinId + 1).fill(address)

      const balanceOfBatch = await lilFoxSkinsContract.balanceOfBatch(addressesArray, tokenIdsArray)
      const ownedSkins: string[] = ["default"]

      const entries: [string, BigNumber][] = Object.entries(balanceOfBatch);
      entries.forEach(([key, value]) => {
        if (value.gt(0)) {
          const skin = tokenIdToSkin.get(Number(key))
          if (!skin) return
          ownedSkins.push(String(skin))
        }
      })
      setOwnedSkins(ownedSkins)
    }
    setUserSkins()
  }, [])

  const isFlask = async () => {
    const provider = window.ethereum;

    try {
      const clientVersion = await provider?.request({
        method: "web3_clientVersion",
      });
      console.debug({ clientVersion });

      // supports MetaMask > v11 or Flask
      const isMetamaskDetected =
        clientVersion.split("/v")[1].replace("v", "").split(".")[0] >= 11 ||
        clientVersion?.includes("flask");

      return provider && isMetamaskDetected;
    } catch {
      return false;
    }
  };

  const startGame = () => {
    setInitiated(true);
    // deploy one cycle so that the game can be started on the correct tag
    if (typeof window !== "undefined") {
      const FoxGame = require("@/scenes").FoxGame;
      setTimeout(() => {
        game.current = new Phaser.Game({
          type: Phaser.AUTO,
          parent: "phaser-container",
          backgroundColor: "rgba(129,186,68,1)",
          width: 800,
          height: 600,
          pixelArt: true,
          physics: {
            default: "arcade",
            arcade: {
              gravity: { y: 0 },
              debug: true,
            },
          },
          scene: FoxGame,
        });
      });
    }
  };

  const closeGame = () => {
    game.current?.destroy(true, false);
    setInitiated(false);
  };

  const autosave = () => {
    if (typeof window !== "undefined") {
      const FoxGame = require("@/scenes").FoxGame;
      const gameScene = game.current?.scene.scenes[0] as typeof FoxGame;
      gameScene.setAutosave();
    }
  };

  const changeSkin = async (skin: string) => {
    if (typeof window !== "undefined") {
      const FoxGame = require("@/scenes").FoxGame;
      const gameScene = game.current?.scene.scenes[0] as typeof FoxGame;

      const skinId = tokenIdToSkin.get(skin)
      console.log({ skinId, skin })
      const skinChanged = await gameScene.changeSkin(skinId, skin);
    }
  };


  return (
    <main className="flex items-center min-h-screen justify-center ">
      {hasFlask && !initiated && (
        <button id="icon" onClick={startGame}>
          <Image src="/fox.png" width="48" height="48" alt="fox icon" />
          <div>Fox.exe</div>
        </button>
      )}

      {!hasFlask && !initiated && (
        <a
          id="flask"
          className="flex flex-col absolute mx-auto my-auto justify-center items-center text-center"
          href="https://metamask.io"
          target="_blank"
        >
          <Image src="/ie.png" width="48" height="48" alt="flask icon" />
          <p>Flask Required</p>
          <p>Get MetaMask</p>
        </a>
      )}
      {initiated && (
        <div className="flex text-center w-[814px] pb-1 window-style absolute top-[50%] left-[50%] mt-[-334px] ml-[-407px] justify-center items-center flex-row ">
          <div
            id="pic"
            className="h-64 w-64 absolute top-0 -left-72 text-center pb-1 window-style justify-center items-center flex-row opacity-0"
          ></div>
          <div className="flex flex-col w-full justify-center items-center">
            <div className="flex m-1 mx-4 justify-between box-border w-[800px] h-12 p-1 bg-[#fed5fb] items-center border-2 border-[#9f1bf5] header">
              <h1 id="title" className="text-2xl font-bold pl-2">
                Fox.exe
              </h1>
              <div className="flex items-center">
                <button id="autosave" className="button" onClick={autosave}>
                  autosave
                </button>
                <button id="close" className="button" onClick={closeGame}>
                  X
                </button>
              </div>
            </div>
            <div id="phaser-container" className="h-[600px] w-[800px]"></div>
          </div>

          <div className="window-style w-fit h-[664px] absolute -right-[250px] top-0 p-2">
            <div className="flex box-border w-full h-12 p-1 bg-[#fed5fb] items-center border-2 border-[#9f1bf5] header">
              <h1 id="title" className="text-2xl font-bold px-2">
                Choose Skin
              </h1>
            </div>
            {ownedSkins.map((skin) => (
              <button
                key={skin}
                id={skin}
                className="skin-button button-inactive flex flex-col gap-y-4 mt-4  items-center justify-center w-full"
                onClick={() => changeSkin(skin)}
              >
                <Image
                  src={`/skin-icons/fox-${skin}-skin.png`}
                  width="48"
                  height="48"
                  alt="fox icon"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
