import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";


// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcrypt");


connectDB();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { groupName, type, project, members } = body;

    if (type === "groupe" && members.length < 2) {
      return NextResponse.json(
        { message: "Group registration requires at least 2 members" },
        { status: 400 }
      );
    }

    const teamLeader = members[0];
    const accountEmail = teamLeader.email;

    const existingUser = await User.findOne({ email: accountEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const accountName = groupName || `${teamLeader.prenom} ${teamLeader.nom}`;
    const generatedPassword = Math.random().toString(36).slice(-10);
    console.log(generatedPassword);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const role = "user";

    const newUser = new User({
      name: accountName,
      email: accountEmail,
      password: hashedPassword,
      role,
      registrationType: type,
      groupName: type === "groupe" ? groupName : undefined,
      project,
      members
    });

    await newUser.save();

    return NextResponse.json(
      {
        message: "Registration successful",
        role,
        generatedPassword
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      {
        message: "Registration error",
        error: error
      },
      { status: 500 }
    );
  }
}
