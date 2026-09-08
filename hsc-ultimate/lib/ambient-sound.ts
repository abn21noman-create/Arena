// ===================================================================
// Ambient Sound Engine — Web Audio API দিয়ে সম্পূর্ণ সিন্থেসাইজড শব্দ
// (কোনো ফাইল আপলোড/হোস্টিং লাগবে না, docs/RESEARCH_UI_UX_READING_ROOM.md
// এর সুপারিশ অনুযায়ী)
// -------------------------------------------------------------------
// ৩টা প্যাটার্ন সিন্থেসাইজ করা হয়েছে: বৃষ্টি (filtered white noise),
// ক্যাফের গুঞ্জন (brown noise + subtle modulation), ফায়ারপ্লেস
// (crackling — random short bursts + low rumble)। সবই লুপিং, খুব হালকা
// ভলিউমে (background presence, distraction না)।
// ===================================================================
export type AmbientSoundType = "rain" | "cafe" | "fireplace" | "wind";

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentGain: GainNode | null = null;
let crackleIntervalId: ReturnType<typeof setInterval> | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

/** সাদা নয়েজ বাফার তৈরি করে (বৃষ্টি/ক্যাফের ভিত্তি) */
function createNoiseBuffer(ctx: AudioContext, colorFactor: number): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2; // ২ সেকেন্ডের লুপ
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // brown-ish noise (low-pass smoothing) — colorFactor যত বেশি তত smoother/গভীর শব্দ
    lastOut = (lastOut + colorFactor * white) / (1 + colorFactor);
    data[i] = lastOut * 3.5; // gain compensation
  }
  return buffer;
}

/** বর্তমানে চলমান sound বন্ধ করে দেয় */
export function stopAmbientSound() {
  if (crackleIntervalId) {
    clearInterval(crackleIntervalId);
    crackleIntervalId = null;
  }
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      // ইতিমধ্যে বন্ধ থাকলে error আসতে পারে, ignore করা হচ্ছে
    }
    currentSource = null;
  }
  currentGain = null;
}

/** ভলিউম পরিবর্তন করে (০ থেকে ১ এর মধ্যে) */
export function setAmbientVolume(volume: number) {
  if (currentGain && audioCtx) {
    currentGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)) * 0.15, audioCtx.currentTime, 0.1);
  }
}

/**
 * নির্দিষ্ট ধরনের ambient sound চালু করে (আগেরটা থাকলে বন্ধ করে নতুনটা
 * শুরু করে)। ব্রাউজারের autoplay policy অনুযায়ী এটা ইউজারের কোনো
 * ইন্টারঅ্যাকশন (ক্লিক) এর পরে কল করতে হবে।
 */
export function playAmbientSound(type: AmbientSoundType, volume = 0.5) {
  stopAmbientSound();
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const gainNode = ctx.createGain();
  gainNode.gain.value = volume * 0.15; // সবসময় হালকা ভলিউমে (distraction এড়াতে)
  gainNode.connect(ctx.destination);
  currentGain = gainNode;

  if (type === "rain") {
    const buffer = createNoiseBuffer(ctx, 0.02); // হালকা color, বৃষ্টির ঝিরিঝিরি শব্দের মতো
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 800; // উচ্চ ফ্রিকোয়েন্সি রেখে হিসহিস শব্দ তৈরি
    source.connect(filter).connect(gainNode);
    source.start();
    currentSource = source;
  } else if (type === "cafe") {
    const buffer = createNoiseBuffer(ctx, 0.3); // গভীর brown noise, ক্যাফের নিচু গুঞ্জন
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 500;
    source.connect(filter).connect(gainNode);
    source.start();
    currentSource = source;
  } else if (type === "fireplace") {
    const buffer = createNoiseBuffer(ctx, 0.4); // নিচু rumble ভিত্তি
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 300;
    source.connect(filter).connect(gainNode);
    source.start();
    currentSource = source;

    // মাঝেমধ্যে "crackle" — ছোট ছোট শব্দ যোগ করা randomly
    crackleIntervalId = setInterval(() => {
      if (!audioCtx || !currentGain) return;
      const crackleSource = audioCtx.createBufferSource();
      const crackleBuffer = createNoiseBuffer(audioCtx, 0.01);
      crackleSource.buffer = crackleBuffer;
      const crackleGain = audioCtx.createGain();
      crackleGain.gain.value = (Math.random() * 0.15 + 0.05) * volume;
      const crackleFilter = audioCtx.createBiquadFilter();
      crackleFilter.type = "bandpass";
      crackleFilter.frequency.value = 2000 + Math.random() * 2000;
      crackleSource.connect(crackleFilter).connect(crackleGain).connect(audioCtx.destination);
      crackleSource.start();
      crackleSource.stop(audioCtx.currentTime + 0.08);
    }, 600 + Math.random() * 900);
  } else if (type === "wind") {
    const buffer = createNoiseBuffer(ctx, 0.15);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 600;
    filter.Q.value = 0.5;
    source.connect(filter).connect(gainNode);
    source.start();
    currentSource = source;
  }
}
