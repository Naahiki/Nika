import { NextResponse } from "next/server";

export async function POST(request) {
  const { username, password } = await request.json();

  const envUsername = process.env.LOGIN_USER;
  const envPassword = process.env.LOGIN_PASS;

  //console.log("Env:", envUsername, envPassword); 

  if (username === envUsername && password === envPassword) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
