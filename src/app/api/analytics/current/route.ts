import { calculateReturnRate } from "@/lib/calculations";
import { getStocks, getSnapshots, getTargets } from "@/lib/db";
import type { Stock } from "@/types/stock";
import {
  AccountSummary,
  AssetTypeSummary,
  CurrentAssetStatus,
  StockSummary,
} from "@/types/analytics";
import type { TargetStore } from "@/types/target";
import { NextResponse } from "next/server";

// GET: 현재 자산 현황 조회
export async function GET() {
  try {
    const [stocks, snapshots, targetStore] = await Promise.all([
      getStocks(),
      getSnapshots(),
      getTargets(),
    ]);

    if (snapshots.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          totalValue: 0,
          totalPurchaseAmount: 0,
          totalGainLoss: 0,
          totalReturnRate: 0,
          byAssetType: [],
          byAccount: [],
          byStock: [],
        } as CurrentAssetStatus,
      });
    }

    const latestSnapshot = snapshots[0];

    const stockMap = new Map(stocks.map((stock: Stock) => [stock.id, stock]));

    let totalValue = 0;
    let totalPurchaseAmount = 0;
    let totalGainLoss = 0;

    const assetTypeMap = new Map<
      string,
      { purchase: number; value: number; gainLoss: number }
    >();
    const accountMap = new Map<
      string,
      { purchase: number; value: number; gainLoss: number }
    >();
    const stockSummaryMap = new Map<
      string,
      {
        purchase: number;
        value: number;
        gainLoss: number;
        quantity: number;
        stock: Stock;
      }
    >();

    for (const item of latestSnapshot.items) {
      const stock = stockMap.get(item.stockId);
      if (!stock) continue;

      totalValue += item.valuationAmount;
      totalPurchaseAmount += item.purchaseAmount;
      totalGainLoss += item.gainLoss;

      const assetTypeKey = stock.assetGroup;
      const assetTypeData = assetTypeMap.get(assetTypeKey) || {
        purchase: 0,
        value: 0,
        gainLoss: 0,
      };
      assetTypeData.purchase += item.purchaseAmount;
      assetTypeData.value += item.valuationAmount;
      assetTypeData.gainLoss += item.gainLoss;
      assetTypeMap.set(assetTypeKey, assetTypeData);

      const accountKey = stock.accountType;
      const accountData = accountMap.get(accountKey) || {
        purchase: 0,
        value: 0,
        gainLoss: 0,
      };
      accountData.purchase += item.purchaseAmount;
      accountData.value += item.valuationAmount;
      accountData.gainLoss += item.gainLoss;
      accountMap.set(accountKey, accountData);

      const stockSummaryData = stockSummaryMap.get(item.stockId) || {
        purchase: 0,
        value: 0,
        gainLoss: 0,
        quantity: 0,
        stock,
      };
      stockSummaryData.purchase += item.purchaseAmount;
      stockSummaryData.value += item.valuationAmount;
      stockSummaryData.gainLoss += item.gainLoss;
      stockSummaryData.quantity += item.quantity;
      stockSummaryMap.set(item.stockId, stockSummaryData);
    }

    const byAssetType: AssetTypeSummary[] = Array.from(
      assetTypeMap.entries(),
    ).map(([assetType, data]) => ({
      assetType,
      totalValue: data.value,
      totalPurchaseAmount: data.purchase,
      totalGainLoss: data.gainLoss,
      returnRate: calculateReturnRate(data.gainLoss, data.purchase),
      targetAmount: targetStore[assetType as keyof TargetStore] || 0,
    }));

    const byAccount: AccountSummary[] = Array.from(accountMap.entries()).map(
      ([accountName, data]) => ({
        accountType: accountName,
        totalValue: data.value,
        totalPurchaseAmount: data.purchase,
        totalGainLoss: data.gainLoss,
        returnRate: calculateReturnRate(data.gainLoss, data.purchase),
      }),
    );

    const byStock: StockSummary[] = Array.from(stockSummaryMap.values()).map(
      (data) => ({
        stock: data.stock,
        totalValue: data.value,
        totalPurchaseAmount: data.purchase,
        totalGainLoss: data.gainLoss,
        returnRate: calculateReturnRate(data.gainLoss, data.purchase),
        quantity: data.quantity,
      }),
    );

    const result: CurrentAssetStatus = {
      totalValue,
      totalPurchaseAmount,
      totalGainLoss,
      totalReturnRate: calculateReturnRate(totalGainLoss, totalPurchaseAmount),
      byAssetType,
      byAccount,
      byStock,
    };

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error("Error calculating current status:", error);
    return NextResponse.json(
      { ok: false, error: "현재 자산 현황을 계산하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
