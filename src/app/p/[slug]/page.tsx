import type { Metadata } from "next";
import ProductPageView from "@/components/ProductPageView";
import { getProducts } from "@/lib/catalog";
import { productMetadata } from "@/lib/product-meta";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProducts("en")).find((p) => p.id === slug);
  return product ? productMetadata(product, "en") : { title: "Product not found" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProductPageView slug={slug} lang="en" />;
}