"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export function CognitiveHeatmap() {
  const [activeArea, setActiveArea] = useState<string | null>(null);

  const areas = [
    { name: "Logic (Physics/Math)", level: 85, color: "bg-emerald-500" },
    { name: "Memory (Biology)", level: 40, color: "bg-rose-500" },
    { name: "Critical Thinking", level: 65, color: "bg-violet-500" },
    { name: "Language Sync", level: 90, color: "bg-amber-500" },
  ];

  return (
    <Card className="p-6 glass-aurora">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        🧠 রিয়েল-টাইম কগনিটিভ হিটম্যাপ
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {areas.map((area) => (
          <motion.div 
            key={area.name}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-card border border-border cursor-pointer transition-colors hover:border-primary/40"
            onClick={() => setActiveArea(area.name)}
          >
            <p className="text-xs text-muted-foreground uppercase mb-1">{area.name}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black">{area.level}%</span>
              <div className={`h-1.5 flex-1 rounded-full bg-muted mb-2 overflow-hidden`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${area.level}%` }}
                  className={`h-full ${area.color} shadow-xs`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {activeArea && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xs italic text-primary"
        >
          সিংগুলারিটি নোট: তোমার {activeArea} এখন পিক পারফরম্যান্সে আছে!
        </motion.p>
      )}
    </Card>
  );
}
