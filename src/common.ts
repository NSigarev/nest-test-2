import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";

export enum FindOptionsOperator {
  GreaterOrEqual = 'gte',
  LowerOrEqual = 'lte',
  Equal = 'eq',
  NotEqual = 'ne',
  Lower = 'lt',
  Greater = 'gt',
}

export enum FindOptionsType {
  Any = 'any',
  Date = 'date',
  Year = 'year',
  String = 'string',
  Array = 'array',
}

export interface FindOptionField {
  type: FindOptionsType;
  operator: FindOptionsOperator;
  value: any;
}

export const SetFindAllOptions = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  opt: Record<string, FindOptionField>,
  complexFieldSetter?: (
    qb: SelectQueryBuilder<T>,
    entry: [string, FindOptionField],
  ) => boolean,
  ignoreList?: string[],
) => {
  if (!opt) return;

  let paramIndex = 0;

  const addNullCondition = (field: string, operator: string) => {
    qb.andWhere(`${field} ${operator} NULL`);
  };

  const addStringNullCondition = (field: string, operator: string) => {
    qb.andWhere(`char_length(${field}) ${operator} 2`);
  };

  const getOperatorSymbol = (operator: FindOptionsOperator) => {
    switch (operator) {
      case FindOptionsOperator.GreaterOrEqual:
        return '>=';
      case FindOptionsOperator.LowerOrEqual:
        return '<=';
      case FindOptionsOperator.NotEqual:
        return '!=';
      case FindOptionsOperator.Greater:
        return '>';
      case FindOptionsOperator.Lower:
        return '<';
      default:
        return '=';
    }
  };

  for (const key in opt) {
    paramIndex++;
    const option = opt[key];

    if (
      !('value' in option) ||
      option.value === undefined ||
      (ignoreList && ignoreList.some((val) => val == key)) ||
      (complexFieldSetter !== undefined &&
        complexFieldSetter(qb, [key, option]))
    )
      continue;

    if (option.value === null) {
      if (option.type === FindOptionsType.String) {
        option.operator === FindOptionsOperator.Equal
          ? addStringNullCondition(key, '<')
          : addStringNullCondition(key, '>=');
      } else if (option.type === FindOptionsType.Array) {
        option.operator === FindOptionsOperator.Equal
          ? qb.andWhere(`${key} = '{}'`)
          : qb.andWhere(`${key} != '{}'`);
      } else {
        option.operator === FindOptionsOperator.Equal
          ? addNullCondition(key, 'IS')
          : addNullCondition(key, 'IS NOT');
      }
      continue;
    }
    const fieldPart =
      option.type === FindOptionsType.Year
        ? `date_part('year', (${key})::date)`
        : key;
    if (Array.isArray(option.value)) {
      const containsNull = option.value.includes(null);
      if (option.type === FindOptionsType.Array)
        qb.andWhere(`${fieldPart} && :values`, { values: option.value });
      else
        qb.andWhere(
          containsNull
            ? `(${fieldPart} IS NULL OR ${fieldPart} IN (:...${paramIndex}))`
            : `${fieldPart} IN (:...${paramIndex})`,
          { [paramIndex]: option.value },
        );
    } else {
      const operatorSymbol = getOperatorSymbol(option.operator);
      qb.andWhere(`${fieldPart} ${operatorSymbol} :${paramIndex}`, {
          [paramIndex]: option.value,
        });
    }
  }
};

export function ValidateFields(allowedStrings: readonly string[]) {
  return createParamDecorator((_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const body = request.body as Record<string, FindOptionField>;

    if (typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Invalid request body');
    }

    const invalidKeys = Object.keys(body).filter(
      (key) => !allowedStrings.includes(key),
    );

    if (invalidKeys.length > 0) {
      throw new BadRequestException(
        `Invalid fields: ${invalidKeys.join(
          ', ',
        )}. Allowed fields are: ${allowedStrings.join(', ')}`,
      );
    }
    for (const [key, val] of Object.entries(body)) {
      const { type, operator, value } = val;

      if (!type || !operator) {
        throw new BadRequestException(
          `Field '${key}' is missing required properties. 'type' and 'operator' are mandatory.`,
        );
      }

      if (type === FindOptionsType.Date) {
        const valAsDate = new Date(value);
        if (isNaN(valAsDate.getTime())) throw new BadRequestException(
          `Invalid argument value: ${value}, must be string castable to date`,
        );
      }

      if (!Object.values(FindOptionsType).includes(type)) {
        throw new BadRequestException(
          `Invalid 'type' for field '${key}'. Allowed values are: ${Object.values(
            FindOptionsType,
          ).join(', ')}`,
        );
      }

      if (!Object.values(FindOptionsOperator).includes(operator)) {
        throw new BadRequestException(
          `Invalid 'operator' for field '${key}'. Allowed values are: ${Object.values(
            FindOptionsOperator,
          ).join(', ')}`,
        );
      }
    }
    return body;
  })();
}
