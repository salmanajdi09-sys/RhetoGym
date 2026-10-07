import React from "react";
import photo from "../../Screenshot 2026-10-07 211307.png";

export default function CreatorPhoto() {
  return (
    <div className="relative mx-auto w-full max-w-[16rem]">
      <div className="relative aspect-[4/5] blob-a overflow-hidden border border-lavender">
        <img 
          src={photo} 
          alt="Salma" 
          className="w-full h-full object-cover" 
        />
      </div>
    </div>
  );
}
