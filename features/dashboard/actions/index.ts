"use server";

import { currentUser } from "@/features/auth/actions";
import { db } from "@/lib/db";
import { Templates } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const createPlayground = async (data: {
  title: string;
  template: Templates;
  description?: string;
}) => {
  const { title, template, description } = data;
  const user = await currentUser();

  try {
    const playground = await db.playground.create({
      data: {
        title,
        template,
        description: description || "",
        userId: user?.id!,
      },
    });

    return playground;
  } catch (error) {
    console.error(error);
  }
};

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();
  try {
    const playground = await db.playground.findMany({
      where: {
        userId: user?.id!,
      },
      include: {
        user: true,
        Starmark: {
          where: {
            userId: user?.id!,
          },
          select: {
            isMarked: true,
          },
        },
      },
    });

    return playground;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteProjectById = async (id: string) => {
  try {
    await db.playground.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error deleting project:", error);
  }
};

export const editProjectById = async (
  id: string,
  data: { title: string; description: string }
) => {
  try {
    await db.playground.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error("Error editing project:", error);
  }
};

export const duplicateProjectById = async (id: string) => {
  try {
    const originalPlayground = await db.playground.findUnique({
      where: { id },
    });

    if (!originalPlayground) {
      throw new Error("Playground not found");
    }

    const duplicatedPlayground = await db.playground.create({
      data: {
        title: `${originalPlayground.title} (Copy)`,
        template: originalPlayground.template,
        description: originalPlayground.description,
        userId: originalPlayground.userId,
      },
    });

    revalidatePath("/dashboard");

    return duplicatedPlayground;
  } catch (error) {
    console.error("Error duplicating project:", error);
  }
};
