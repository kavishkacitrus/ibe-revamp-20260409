'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { increment, decrement } from '@/store/slices/counterSlice';

export default function Counter() {
    const count = useAppSelector((state) => state.counter.value);
    const dispatch = useAppDispatch();

    return (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-lg border border-zinc-200 p-6 :border-zinc-800">
            <h2 className="text-xl font-medium text-black :text-white">Redux Counter</h2>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => dispatch(decrement())}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[.08] text-xl transition-colors hover:bg-black/[.04] :border-white/[.145] :hover:bg-white/[.06]"
                >
                    -
                </button>
                <span className="text-2xl font-semibold tabular-nums text-black :text-white">{count}</span>
                <button
                    onClick={() => dispatch(increment())}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-xl text-background transition-colors hover:bg-[#383838] :hover:bg-[#ccc]"
                >
                    +
                </button>
            </div>
        </div>
    );
}
