from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_permission

from app.models import (
    FinancialYear,
    Route,
    Village,
    District,
    Taluka,
    User,
)

from app.schemas.master import (
    FinancialYearCreate,
    FinancialYearResponse,
    RouteCreate,
    RouteResponse,
    VillageCreate,
    VillageResponse,
    DistrictResponse,
    TalukaResponse,
)


router = APIRouter(
    prefix="/api/v1/master",
    tags=["Master Data"],
)


# ============================================================
# FINANCIAL YEARS
# ============================================================

@router.post(
    "/financial-years",
    response_model=FinancialYearResponse,
)
def create_financial_year(
    data: FinancialYearCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("FINANCIAL_YEAR_CREATE")
    ),
):
    existing = db.scalar(
        select(FinancialYear).where(
            FinancialYear.name == data.name
        )
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Financial year already exists",
        )

    financial_year = FinancialYear(
        name=data.name,
        start_date=data.start_date,
        end_date=data.end_date,
    )

    db.add(financial_year)
    db.commit()
    db.refresh(financial_year)

    return financial_year


@router.get(
    "/financial-years",
    response_model=list[FinancialYearResponse],
)
def get_financial_years(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("FINANCIAL_YEAR_VIEW")
    ),
):
    return db.scalars(
        select(FinancialYear)
        .order_by(FinancialYear.start_date.desc())
    ).all()


# ============================================================
# ROUTES
# ============================================================

@router.post(
    "/routes",
    response_model=RouteResponse,
)
def create_route(
    data: RouteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("ROUTE_CREATE")
    ),
):
    financial_year = db.get(
        FinancialYear,
        data.financial_year_id,
    )

    if not financial_year:
        raise HTTPException(
            status_code=404,
            detail="Financial year not found",
        )

    existing = db.scalar(
        select(Route).where(
            Route.code == data.code,
            Route.financial_year_id
            == data.financial_year_id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Route code already exists for this financial year",
        )

    route = Route(
        code=data.code,
        name=data.name,
        description=data.description,
        financial_year_id=data.financial_year_id,
    )

    db.add(route)
    db.commit()
    db.refresh(route)

    return route


@router.get(
    "/routes",
    response_model=list[RouteResponse],
)
def get_routes(
    financial_year_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("ROUTE_VIEW")
    ),
):
    query = select(Route)

    if financial_year_id:
        query = query.where(
            Route.financial_year_id
            == financial_year_id
        )

    query = query.order_by(Route.name)

    return db.scalars(query).all()


# ============================================================
# DISTRICTS
# ============================================================

@router.get(
    "/districts",
    response_model=list[DistrictResponse],
)
def get_districts(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("VILLAGE_VIEW")
    ),
):
    return db.scalars(
        select(District)
        .where(District.is_active == True)
        .order_by(District.name)
    ).all()


# ============================================================
# TALUKAS
# ============================================================

@router.get(
    "/talukas",
    response_model=list[TalukaResponse],
)
def get_talukas(
    district_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("VILLAGE_VIEW")
    ),
):
    query = select(Taluka).where(
        Taluka.is_active == True
    )

    if district_id:
        query = query.where(
            Taluka.district_id == district_id
        )

    query = query.order_by(Taluka.name)

    return db.scalars(query).all()


# ============================================================
# VILLAGES
# ============================================================

@router.post(
    "/villages",
    response_model=VillageResponse,
)
def create_village(
    data: VillageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("VILLAGE_CREATE")
    ),
):
    taluka = db.get(
        Taluka,
        data.taluka_id,
    )

    if not taluka:
        raise HTTPException(
            status_code=404,
            detail="Taluka not found",
        )

    if not taluka.is_active:
        raise HTTPException(
            status_code=400,
            detail="Taluka is inactive",
        )

    if data.route_id is not None:
        route = db.get(
            Route,
            data.route_id,
        )

        if not route:
            raise HTTPException(
                status_code=404,
                detail="Route not found",
            )

    village = Village(
        name=data.name,
        taluka_id=data.taluka_id,
        route_id=data.route_id,
        sequence_no=data.sequence_no,
    )

    db.add(village)
    db.commit()
    db.refresh(village)

    return village


@router.get(
    "/villages",
    response_model=list[VillageResponse],
)
def get_villages(
    taluka_id: int | None = None,
    route_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("VILLAGE_VIEW")
    ),
):
    query = select(Village).where(
        Village.is_active == True
    )

    if taluka_id:
        query = query.where(
            Village.taluka_id == taluka_id
        )

    if route_id:
        query = query.where(
            Village.route_id == route_id
        )

    query = query.order_by(
        Village.sequence_no,
        Village.name,
    )

    return db.scalars(query).all()


# ============================================================
# ROUTE WORKERS
# ============================================================

@router.post(
    "/routes/{route_id}/workers/{user_id}",
)
def assign_worker_to_route(
    route_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("ROUTE_EDIT")
    ),
):
    route = db.get(Route, route_id)

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found",
        )

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="User is inactive",
        )

    if user not in route.workers:
        route.workers.append(user)
        db.commit()

    return {
        "success": True,
        "message": "Worker assigned to route",
        "route_id": route_id,
        "user_id": user_id,
    }


@router.delete(
    "/routes/{route_id}/workers/{user_id}",
)
def remove_worker_from_route(
    route_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("ROUTE_EDIT")
    ),
):
    route = db.get(Route, route_id)

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found",
        )

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if user in route.workers:
        route.workers.remove(user)
        db.commit()

    return {
        "success": True,
        "message": "Worker removed from route",
        "route_id": route_id,
        "user_id": user_id,
    }


@router.get(
    "/routes/{route_id}/workers",
)
def get_route_workers(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("ROUTE_VIEW")
    ),
):
    route = db.get(Route, route_id)

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found",
        )

    return [
        {
            "id": worker.id,
            "username": worker.username,
            "full_name": worker.full_name,
            "mobile_number": worker.mobile_number,
            "is_active": worker.is_active,
        }
        for worker in route.workers
    ]