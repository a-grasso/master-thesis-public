// smithy-typescript generated code
import { WeatherServiceException as __BaseException } from "./WeatherServiceException";
import { ExceptionOptionType as __ExceptionOptionType } from "@smithy/smithy-client";
import { StreamingBlobTypes } from "@smithy/types";

/**
 * @public
 */
export interface CityCoordinates {
  latitude: number | undefined;
  longitude: number | undefined;
}

/**
 * @public
 */
export interface GetForecastInput {
  cityId: string | undefined;
}

/**
 * @public
 */
export interface GetForecastOutput {
  chanceOfRain?: number;
}

/**
 * @public
 */
export interface GetCityInput {
  cityId: string | undefined;
}

/**
 * @public
 */
export interface GetCityOutput {
  name: string | undefined;
  coordinates: CityCoordinates | undefined;
}

/**
 * @public
 */
export class NoSuchResource extends __BaseException {
  readonly name: "NoSuchResource" = "NoSuchResource";
  readonly $fault: "client" = "client";
  resourceType: string | undefined;
  /**
   * @internal
   */
  constructor(opts: __ExceptionOptionType<NoSuchResource, __BaseException>) {
    super({
      name: "NoSuchResource",
      $fault: "client",
      ...opts
    });
    Object.setPrototypeOf(this, NoSuchResource.prototype);
    this.resourceType = opts.resourceType;
  }
}

/**
 * @public
 */
export interface ListCitiesInput {
  nextToken?: string;
  pageSize?: number;
}

/**
 * @public
 */
export interface CitySummary {
  cityId: string | undefined;
  name: string | undefined;
}

/**
 * @public
 */
export interface ListCitiesOutput {
  nextToken?: string;
  items: (CitySummary)[] | undefined;
}

/**
 * @public
 */
export interface GetCurrentTimeOutput {
  time: Date | undefined;
}

/**
 * @public
 */
export interface LeaveEvent {
}

/**
 * @public
 */
export interface Message {
  message?: string;
}

/**
 * @public
 */
export interface Movement {
  velocity?: number;
}

/**
 * An example error emitted when the client is throttled
 * and should terminate the event stream.
 * @public
 */
export class ThrottlingError extends __BaseException {
  readonly name: "ThrottlingError" = "ThrottlingError";
  readonly $fault: "client" = "client";
  $retryable = {
    throttling: true,
  };
  /**
   * @internal
   */
  constructor(opts: __ExceptionOptionType<ThrottlingError, __BaseException>) {
    super({
      name: "ThrottlingError",
      $fault: "client",
      ...opts
    });
    Object.setPrototypeOf(this, ThrottlingError.prototype);
  }
}

/**
 * @public
 */
export type MovementEvents =
  | MovementEvents.DownMember
  | MovementEvents.LeftMember
  | MovementEvents.RightMember
  | MovementEvents.ThrottlingErrorMember
  | MovementEvents.UpMember
  | MovementEvents.$UnknownMember

/**
 * @public
 */
export namespace MovementEvents {

  export interface UpMember {
    up: Movement;
    down?: never;
    left?: never;
    right?: never;
    throttlingError?: never;
    $unknown?: never;
  }

  export interface DownMember {
    up?: never;
    down: Movement;
    left?: never;
    right?: never;
    throttlingError?: never;
    $unknown?: never;
  }

  export interface LeftMember {
    up?: never;
    down?: never;
    left: Movement;
    right?: never;
    throttlingError?: never;
    $unknown?: never;
  }

  export interface RightMember {
    up?: never;
    down?: never;
    left?: never;
    right: Movement;
    throttlingError?: never;
    $unknown?: never;
  }

  /**
   * An example error emitted when the client is throttled
   * and should terminate the event stream.
   * @public
   */
  export interface ThrottlingErrorMember {
    up?: never;
    down?: never;
    left?: never;
    right?: never;
    throttlingError: ThrottlingError;
    $unknown?: never;
  }

  /**
   * @public
   */
  export interface $UnknownMember {
    up?: never;
    down?: never;
    left?: never;
    right?: never;
    throttlingError?: never;
    $unknown: [string, any];
  }

  export interface Visitor<T> {
    up: (value: Movement) => T;
    down: (value: Movement) => T;
    left: (value: Movement) => T;
    right: (value: Movement) => T;
    throttlingError: (value: ThrottlingError) => T;
    _: (name: string, value: any) => T;
  }

  export const visit = <T>(
    value: MovementEvents,
    visitor: Visitor<T>
  ): T => {
    if (value.up !== undefined) return visitor.up(value.up);
    if (value.down !== undefined) return visitor.down(value.down);
    if (value.left !== undefined) return visitor.left(value.left);
    if (value.right !== undefined) return visitor.right(value.right);
    if (value.throttlingError !== undefined) return visitor.throttlingError(value.throttlingError);
    return visitor._(value.$unknown[0], value.$unknown[1]);
  }

}
/**
 * @internal
 */
export const MovementEventsFilterSensitiveLog = (obj: MovementEvents): any => {
  if (obj.up !== undefined) return {up:
    obj.up
  };
  if (obj.down !== undefined) return {down:
    obj.down
  };
  if (obj.left !== undefined) return {left:
    obj.left
  };
  if (obj.right !== undefined) return {right:
    obj.right
  };
  if (obj.throttlingError !== undefined) return {throttlingError:
    obj.throttlingError
  };
  if (obj.$unknown !== undefined) return {[obj.$unknown[0]]: 'UNKNOWN'};
}

/**
 * @public
 */
export type PublishEvents =
  | PublishEvents.LeaveMember
  | PublishEvents.MessageMember
  | PublishEvents.$UnknownMember

/**
 * @public
 */
export namespace PublishEvents {

  export interface MessageMember {
    message: Message;
    leave?: never;
    $unknown?: never;
  }

  export interface LeaveMember {
    message?: never;
    leave: LeaveEvent;
    $unknown?: never;
  }

  /**
   * @public
   */
  export interface $UnknownMember {
    message?: never;
    leave?: never;
    $unknown: [string, any];
  }

  export interface Visitor<T> {
    message: (value: Message) => T;
    leave: (value: LeaveEvent) => T;
    _: (name: string, value: any) => T;
  }

  export const visit = <T>(
    value: PublishEvents,
    visitor: Visitor<T>
  ): T => {
    if (value.message !== undefined) return visitor.message(value.message);
    if (value.leave !== undefined) return visitor.leave(value.leave);
    return visitor._(value.$unknown[0], value.$unknown[1]);
  }

}
/**
 * @internal
 */
export const PublishEventsFilterSensitiveLog = (obj: PublishEvents): any => {
  if (obj.message !== undefined) return {message:
    obj.message
  };
  if (obj.leave !== undefined) return {leave:
    obj.leave
  };
  if (obj.$unknown !== undefined) return {[obj.$unknown[0]]: 'UNKNOWN'};
}

/**
 * @public
 */
export interface PublishMessagesInput {
  room?: string;
  messages?: AsyncIterable<PublishEvents>;
}

/**
 * @internal
 */
export const PublishMessagesInputFilterSensitiveLog = (obj: PublishMessagesInput): any => ({
  ...obj,
  ...(obj.messages && { messages:
    'STREAMING_CONTENT'
  }),
})

/**
 * @public
 */
export interface StreamingOperationInput {
}

/**
 * @public
 */
export interface StreamingOperationOutput {
  output?: StreamingBlobTypes;
}

/**
 * @internal
 */
export const StreamingOperationOutputFilterSensitiveLog = (obj: StreamingOperationOutput): any => ({
  ...obj,
})

/**
 * @public
 */
export interface SubscribeToMovementsInput {
}

/**
 * @public
 */
export interface SubscribeToMovementsOutput {
  movements?: AsyncIterable<MovementEvents>;
}

/**
 * @internal
 */
export const SubscribeToMovementsOutputFilterSensitiveLog = (obj: SubscribeToMovementsOutput): any => ({
  ...obj,
  ...(obj.movements && { movements:
    'STREAMING_CONTENT'
  }),
})
