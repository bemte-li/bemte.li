"use client";

import Editor from "@/components/editor";
import Rodape from "@/components/rodape";
import React, { useState } from "react";

export default function Page() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [title, setTitle] = useState("");

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrom(e.target.value);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTo(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSendTest = () => {
    console.log("Send test");
  };

  const handlePreview = () => {
    console.log("Preview");
  };

  const handleSave = () => {
    console.log("Save");
  };

  const handleSend = () => {
    console.log("Send");
  };

  return (
    <div className="h-screen">
      <div className="flex max-w-full justify-end">
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
          onClick={handleSendTest}
        >
          Enviar teste
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4"
          onClick={handlePreview}
        >
          Visualizar
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4"
          onClick={handleSave}
        >
          Salvar
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
          onClick={handleSend}
        >
          Enviar
        </button>
      </div>
      <div className="flex flex-col max-w-screen-sm mx-auto p-6">
        <label
          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
          htmlFor="from"
        >
          De:
        </label>
        <input
          type="text"
          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
          id="from"
          value={from}
          onChange={handleFromChange}
        />

        <label
          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
          htmlFor="to"
        >
          Para:
        </label>
        <input
          type="text"
          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
          id="to"
          value={to}
          onChange={handleToChange}
        />

        <label
          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
          htmlFor="title"
        >
          Título:
        </label>
        <input
          type="text"
          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
          id="title"
          value={title}
          onChange={handleTitleChange}
        />
      </div>
      <Editor />
      <Rodape />
    </div>
  );
}
