import { NextResponse } from "next/server";
import connectDB from "@/app/lib/server/mongodb";
import { Registration } from "@/app/lib/server/models";
import { EDITION } from "@/app/lib/contest";

/**
 * Aggregate counts only — never a name, a project or an address. Public on
 * purpose: the home page shows them live.
 */
export async function GET() {
  try {
    await connectDB();
    const [row] = await Registration.aggregate<{ registrations: number; participants: number; schools: string[] }>([
      { $match: { edition: EDITION } },
      { $unwind: "$members" },
      {
        $group: {
          _id: null,
          registrations: { $addToSet: "$_id" },
          participants: { $sum: 1 },
          schools: { $addToSet: { $toUpper: "$members.etablissement" } },
        },
      },
      { $project: { _id: 0, registrations: { $size: "$registrations" }, participants: 1, schools: 1 } },
    ]);
    return NextResponse.json(
      {
        edition: EDITION,
        registrations: row?.registrations ?? 0,
        participants: row?.participants ?? 0,
        schools: row?.schools.length ?? 0,
      },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
    );
  } catch {
    return NextResponse.json({ message: "Statistiques indisponibles." }, { status: 503 });
  }
}
