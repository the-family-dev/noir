"use client";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export const PersonaCard = observer(() => {
  return (
    <div className="group perspective">
      <div className="relative transition-all duration-300 transform-gpu group-hover:scale-105 group-hover:-translate-y-2 group-hover:rotate-1 group-hover:shadow-[0_25px_35px_-10px_rgba(0,0,0,0.7)]">
        {/* Эффект старой фотографии с выцветанием */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg z-10" />

        {/* Виньетка в стиле нуар */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-lg z-10" />

        <Image
          className="rounded-lg sepia group-hover:sepia-0 transition-all duration-500"
          width={240}
          height={360}
          src={"/kapi.jpeg"}
          alt="Kapi"
        />

        {/* Рамка как у старого фото */}
        <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 rounded-lg transition-all duration-300" />
      </div>
    </div>
  );
});
