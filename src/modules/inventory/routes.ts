import { Router, Request, Response } from 'express';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';

export const inventoryRouter = Router();

// GET /api/inventory/consumables - List all consumables inventory
inventoryRouter.get('/consumables', (req: Request, res: Response) => {
  try {
    const consumables = db.getConsumableInventory();
    res.json({
      success: true,
      data: consumables,
      totalCount: consumables.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/inventory/consumables - Add or restock consumable item
inventoryRouter.post('/consumables', requireAdmin, (req: Request, res: Response) => {
  try {
    const item = db.addConsumableInventory(req.body);
    res.status(201).json({
      success: true,
      data: item,
      message: 'Consumable inventory updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/inventory/consumables/:id/restock - Restock stock level
inventoryRouter.put('/consumables/:id/restock', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStockValue, restockReason } = req.body;
    const item = db.updateInventoryStock(id, Number(newStockValue), restockReason);

    if (!item) {
      return res.status(444).json({ success: false, error: 'Consumable item not found' });
    }

    res.json({
      success: true,
      data: item,
      message: `Restocked ${item.itemName} to ${newStockValue} ${item.unit}`,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/inventory/packaging - List packaging inventory
inventoryRouter.get('/packaging', (req: Request, res: Response) => {
  try {
    const packaging = db.getPackagingInventory();
    res.json({
      success: true,
      data: packaging,
      totalCount: packaging.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/inventory/machines - List facility machinery
inventoryRouter.get('/machines', (req: Request, res: Response) => {
  try {
    const machines = db.getFacilityMachines();
    res.json({
      success: true,
      data: machines,
      totalCount: machines.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/inventory/machines/:id/status - Update machine status
inventoryRouter.put('/machines/:id/status', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const machine = db.updateMachineStatus(id, status);

    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' });
    }

    res.json({
      success: true,
      data: machine,
      message: `Machine ${machine.machineCode} status updated to ${status}`,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/inventory/maintenance - List maintenance logs
inventoryRouter.get('/maintenance', (req: Request, res: Response) => {
  try {
    const logs = db.getMaintenanceLogs();
    res.json({
      success: true,
      data: logs,
      totalCount: logs.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
