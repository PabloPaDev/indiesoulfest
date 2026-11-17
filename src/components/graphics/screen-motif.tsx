import type { Motif } from "@/types/game";

type ScreenMotifProps = {
	motif: Motif;
};

export function ScreenMotif({ motif }: ScreenMotifProps) {
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden="true">
			{motif === "cluster" && (
				<>
					<span className="absolute -left-[10%] bottom-[-20%] h-[80%] w-[64%] rounded-full bg-[#d8d8d8]" />
					<span className="absolute top-[6%] left-[16%] h-[40%] w-[34%] rounded-full bg-[#6a6a6a]" />
					<span className="absolute top-[16%] right-[6%] h-[26%] w-[22%] rounded-full bg-[#f3f3f3]" />
					<span className="absolute right-[12%] bottom-[14%] h-[24%] w-[28%] rounded-full bg-[#3a3a3a]" />
				</>
			)}
			{motif === "orbit" && (
				<>
					<span className="absolute top-1/2 left-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-[#d0d0d0]" />
					<span className="absolute top-[18%] left-[22%] h-[22%] w-[22%] rounded-full bg-[#f2f2f2]" />
					<span className="absolute right-[18%] bottom-[20%] h-[16%] w-[16%] rounded-full bg-[#8a8a8a]" />
					<span className="absolute top-1/2 left-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4a4a4a]" />
				</>
			)}
			{motif === "bars" && (
				<>
					<span className="absolute top-[-8%] bottom-[-8%] left-[8%] w-[14%] bg-[#3a3a3a]" />
					<span className="absolute top-[-8%] bottom-[-8%] left-[28%] w-[8%] bg-[#cfcfcf]" />
					<span className="absolute top-[-8%] bottom-[-8%] left-[42%] w-[18%] bg-[#8d8d8d]" />
					<span className="absolute top-[-8%] bottom-[-8%] right-[10%] w-[12%] bg-[#f0f0f0]" />
				</>
			)}
			{motif === "ring" && (
				<>
					<span className="absolute top-[10%] left-[8%] h-[70%] w-[48%] rounded-full border-[14px] border-[#e6e6e6]" />
					<span className="absolute right-[8%] bottom-[12%] h-[46%] w-[34%] bg-[#5a5a5a]" />
					<span className="absolute top-[18%] right-[18%] h-[18%] w-[18%] rounded-full bg-[#f5f5f5]" />
				</>
			)}
			{motif === "signal" && (
				<>
					<span className="absolute inset-x-0 top-1/2 h-[14%] -translate-y-1/2 bg-[#dcdcdc]" />
					<span className="absolute top-[18%] left-[12%] h-[18%] w-[18%] rounded-full bg-[#f4f4f4]" />
					<span className="absolute bottom-[16%] left-[30%] h-[22%] w-[22%] rounded-full bg-[#6e6e6e]" />
					<span className="absolute top-[22%] right-[14%] h-[28%] w-[12%] bg-[#3f3f3f]" />
				</>
			)}
			{motif === "pills" && (
				<>
					<span className="absolute top-[16%] left-[-8%] h-[22%] w-[70%] rounded-full bg-[#d2d2d2]" />
					<span className="absolute right-[-6%] bottom-[22%] h-[24%] w-[62%] rounded-full bg-[#5c5c5c]" />
					<span className="absolute top-[38%] left-[34%] h-[24%] w-[28%] rounded-full bg-[#f7f7f7]" />
				</>
			)}
			{motif === "cross" && (
				<>
					<span className="absolute top-[8%] bottom-[8%] left-1/2 w-[16%] -translate-x-1/2 bg-[#e4e4e4]" />
					<span className="absolute top-1/2 right-[8%] left-[8%] h-[16%] -translate-y-1/2 bg-[#8a8a8a]" />
					<span className="absolute top-1/2 left-1/2 h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a1a1a]" />
					<span className="absolute top-[14%] left-[12%] h-[14%] w-[14%] rounded-full bg-[#f5f5f5]" />
				</>
			)}
			{motif === "dots" && (
				<div className="absolute inset-[10%] grid grid-cols-4 gap-[8%]">
					{Array.from({ length: 12 }, (_, index) => (
						<span
							key={index}
							className={
								index % 3 === 0
									? "aspect-square rounded-full bg-[#f2f2f2]"
									: index % 3 === 1
										? "aspect-square rounded-full bg-[#8a8a8a]"
										: "aspect-square rounded-full bg-[#3d3d3d]"
							}
						/>
					))}
				</div>
			)}
		</div>
	);
}
